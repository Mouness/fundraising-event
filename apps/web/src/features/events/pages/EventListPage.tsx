import { Link } from 'react-router-dom';
import { Plus, Calendar, Target, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import { Button } from '@core/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/ui/card';
import { useEvents } from '@features/events/hooks/useEvents';
import { PageLoader } from '@core/components/ui/page-loader';

export const EventListPage = () => {
    const { events, isLoading } = useEvents();
    const { t } = useTranslation('common');
    const { formatCurrency } = useCurrencyFormatter();

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
                {events.map((event) => {
                    const status = event.status?.toUpperCase() || 'DRAFT';
                    const raised = event.raised || 0;
                    const goal = event.goalAmount || 1; // Avoid division by zero
                    const progress = Math.min(100, Math.round((raised / goal) * 100));

                    return (
                        <Card key={event.id} className="transition-all hover:shadow-md" style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle style={{ color: 'var(--admin-card-text)' }}>{event.name}</CardTitle>
                                        <CardDescription>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${status === 'ACTIVE'
                                        ? 'bg-green-600 text-white dark:bg-green-500'
                                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}>
                                        {status}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Target className="h-3 w-3" /> {t('admin_events.goal')}
                                        </span>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {formatCurrency(event.raised || 0)} / {formatCurrency(event.goalAmount)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3" /> {t('admin_events.donors')}
                                        </span>
                                        <div className="font-semibold" style={{ color: 'var(--admin-card-text)' }}>
                                            {event.donorCount || 0}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                        <span>{t('admin_events.progress')}</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-secondary/20 w-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full" style={{ borderColor: 'var(--admin-border-color)', color: 'var(--admin-card-text)' }}>
                                    <Link to={`/admin/events/${event.slug}`}>
                                        {t('admin_events.manage_event')}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
