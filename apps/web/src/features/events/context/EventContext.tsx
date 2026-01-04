import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();

    const { data: event, isLoading, error } = useQuery({
        queryKey: ['event', slug],
        queryFn: async () => {
            if (!slug) return null;
            // Fetch specific event by slug (or ID)
            const { data } = await api.get<EventResponseDto>(`/events/${slug}`);
            if (!data) {
                throw new Error('Event not found');
            }
            return data;
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
        const isAdmin = location.pathname.startsWith('/admin');
        const backLink = isAdmin ? '/admin/events' : `/${slug || ''}`;
        const backText = isAdmin ? 'Back to Events' : 'Back to Event';

        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h2 className="text-xl font-semibold">Event not found</h2>
                <button onClick={() => navigate(backLink)} className="text-primary hover:underline">
                    {backText}
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

// eslint-disable-next-line react-refresh/only-export-components
export const useEvent = () => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};
