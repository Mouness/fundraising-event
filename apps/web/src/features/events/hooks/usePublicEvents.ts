import { useQuery } from '@tanstack/react-query';
import { api } from '@core/lib/api';
import type { EventResponseDto } from '@fundraising/types';

export const usePublicEvents = () => {
    const { data: events, isLoading, error } = useQuery({
        queryKey: ['public-events'],
        queryFn: async () => {
            const response = await api.get<EventResponseDto[]>('/events/public');
            return response.data;
        }
    });

    return { events: events || [], isLoading, error };
};
