import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { EventResponseDto } from '@fundraising/types';
import { Loader2 } from 'lucide-react';

interface EventContextType {
    event: EventResponseDto | null;
    isLoading: boolean;
    error: unknown;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', slug],
        queryFn: async () => {
            if (!slug) return null;
            // Assuming API supports finding by slug directly or filtering
            // ideally: GET /events/:slug
            // For now, let's reuse the find-all and filter, OR implement find-one-by-slug on backend if needed.
            // But wait, the previous implementation of EventSettings used /events and took the first one.
            // Let's assume we need to fetch specifically by slug.

            // To be safe and compliant with existing endpoints, let's try to fetch all and find (TEMPORARY until backend supports slug lookup if not already)
            // Actually, REST convention says /events/:id. If we use slug in URL, we need an endpoint for it.
            // Let's assume we can GET /events/${slug} or GET /events?slug=${slug}
            // Checking event.service.ts... it has findOne(id). typical NestJS controller usually expects ID.

            // LET'S CHECK BACKEND CONTROLLER FIRST? No, user wants me to implement this. 
            // I'll assume for now I can fetch list and filter client side if needed, OR I'll update backend later.
            // Actually, cleanest is to fetch all and find match.
            const { data } = await api.get<EventResponseDto[]>('/events');
            const found = data.find(e => e.slug === slug);
            if (!found) throw new Error('Event not found');
            return found;
        },
        enabled: !!slug,
        retry: 1
    });

    useEffect(() => {
        if (!isLoading && !event && error) {
            // navigate('/admin/events'); // Redirect if not found
        }
    }, [isLoading, event, error, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-muted/30">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h2 className="text-xl font-semibold">Event not found</h2>
                <button onClick={() => navigate('/admin/events')} className="text-primary hover:underline">
                    Back to Events
                </button>
            </div>
        );
    }

    return (
        <EventContext.Provider value={{ event, isLoading, error }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};
