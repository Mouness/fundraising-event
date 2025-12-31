import { Link } from 'react-router-dom';
import { Plus, Calendar, Target, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/features/events/hooks/useEvents';
import { PageLoader } from '@/components/ui/PageLoader';

export const EventListPage = () => {
    const { events, isLoading } = useEvents();
    const { t } = useTranslation();

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
                        {t('admin_events.title', 'Events')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t('admin_events.subtitle', 'Manage your fundraising campaigns')}
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('admin_events.create', 'Create Event')}
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
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {status}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Target className="h-3 w-3" /> {t('admin_events.goal', 'Goal')}
                                        </span>
                                        <div className="font-semibold" style={{ color: 'var(--admin-card-text)' }}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(event.goalAmount)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3" /> {t('admin_events.donors', 'Donors')}
                                        </span>
                                        <div className="font-semibold" style={{ color: 'var(--admin-card-text)' }}>
                                            {event.donorCount || 0}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                                        <span>{t('admin_events.progress', 'Progress')}</span>
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
                                        {t('admin_events.manage_event', 'Manage Event')}
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
