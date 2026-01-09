import { createContext, useContext, type ReactNode, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@core/lib/api'
import type { EventResponseDto } from '@fundraising/types'
import { Loader2 } from 'lucide-react'
import { Button } from '@core/components/ui/button'
import { useTranslation } from 'react-i18next'

interface EventContextType {
    event: EventResponseDto | null
    isLoading: boolean
    error: unknown
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export const EventProvider = ({ children }: { children: ReactNode }) => {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation('common')

    const {
        data: event,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['event', slug],
        queryFn: async () => {
            if (!slug) return null
            // Fetch specific event by slug (or ID)
            const { data } = await api.get<EventResponseDto>(`/events/${slug}`)
            if (!data) {
                throw new Error('Event not found')
            }
            return data
        },
        enabled: !!slug,
        retry: 1,
    })

    useEffect(() => {
        if (!isLoading && !event && error) {
            // navigate('/admin/events'); // Redirect if not found
        }
    }, [isLoading, event, error, navigate])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (slug && (error || !event)) {
        const isAdmin = location.pathname.startsWith('/admin')

        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h2 className="text-xl font-semibold">{t('not_found.event_not_found')}</h2>
                <div className="flex gap-4">
                    <Button onClick={() => navigate('/')} variant="outline">
                        {t('not_found.back_to_home')}
                    </Button>
                    {isAdmin ? (
                        <Button onClick={() => navigate('/admin/events')}>
                            {t('not_found.back_to_events')}
                        </Button>
                    ) : (
                        <Button onClick={() => navigate(`/${slug || ''}`)} disabled={!slug}>
                            {t('not_found.back_to_event')}
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <EventContext.Provider value={{ event: event ?? null, isLoading, error }}>
            {children}
        </EventContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEvent = () => {
    const context = useContext(EventContext)
    if (context === undefined) {
        throw new Error('useEvent must be used within an EventProvider')
    }
    return context
}
