import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@core/components/ui/button';
import { EventCard } from '../components/EventCard';
import { useEvents } from '@features/events/hooks/useEvents';
import { PageLoader } from '@core/components/ui/page-loader';

export const EventListPage = () => {
    const { events, isLoading } = useEvents();
    const { t } = useTranslation('common');

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><PageLoader /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--admin-heading-color)' }}
                    >
                        {t('admin_events.title')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('admin_events.subtitle')}
                    </p>
                </div>
                <Button className="gap-2" asChild>
                    <Link to="/admin/events/new">
                        <Plus className="h-4 w-4" />
                        {t('admin_events.create')}
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
};
