import { useQuery } from '@tanstack/react-query';
import { api } from '@core/lib/api';

export interface DonationDto {
    id: string;
    amount: number;
    currency: string;
    donorName: string;
    donorEmail?: string;
    message?: string;
    isAnonymous: boolean;
    createdAt: string;
    status: string;
    paymentMethod: string;
}

export const useDonations = (eventId?: string, limit: number = 20) => {
    const { data: donations, isLoading, error } = useQuery({
        queryKey: ['donations', eventId, limit],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (eventId) params.append('eventId', eventId);
            params.append('limit', limit.toString());

            const response = await api.get<{ data: DonationDto[], total: number }>(`/donations?${params.toString()}`);
            return response.data.data;
        },
        enabled: !!eventId
    });

    return { donations: donations || [], isLoading, error };
};
