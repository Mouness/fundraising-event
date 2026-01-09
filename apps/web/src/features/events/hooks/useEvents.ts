import { useQuery } from '@tanstack/react-query';
import { api } from '@core/lib/api';
import type { EventResponseDto } from '@fundraising/types';

export const useEvents = () => {
    const { data: events, isLoading, error } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const response = await api.get<EventResponseDto[]>('/events');
            return response.data;
        }
    });

    return { events: events || [], isLoading, error };
};
