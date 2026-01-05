import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@core/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@core/components/ui/button';
import { Link } from 'react-router-dom';
import { useEvents } from '@features/events/hooks/useEvents';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import { Loader2, TrendingUp, Users, Calendar, ArrowRight } from 'lucide-react';

export const DashboardPage = () => {
    const { t } = useTranslation('common');
    const { events, isLoading } = useEvents();
    const { formatCurrency } = useCurrencyFormatter();

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Aggregations
    const totalRaised = events.reduce((sum, e) => sum + (e.raised || 0), 0);
    const totalDonors = events.reduce((sum, e) => sum + (e.donorCount || 0), 0);
    const activeEvents = events.filter(e => e.status === 'ACTIVE');
    const activeEventsCount = activeEvents.length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                    <h2
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--admin-heading-color)' }}
                    >
                        {t('dashboard.title')}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {t('dashboard.platform_overview')}
                    </p>
                </div>
            </div>

            {/* Global Stats */}
            < div className="grid gap-4 md:grid-cols-3" >
                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.stats.revenue')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {formatCurrency(totalRaised)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.stats.events_count', { count: events.length })}
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.stats.active_events')}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {activeEventsCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.stats.currently_live')}
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.stats.total_donors')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {totalDonors}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.stats.donors_description')}
                        </p>
                    </CardContent>
                </Card>
            </div >

            {/* Active Events Grid */}
            < div className="space-y-4" >
                <h3 className="text-xl font-semibold tracking-tight">{t('dashboard.campaigns.title')}</h3>
                {
                    activeEvents.length === 0 ? (
                        <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                            {t('dashboard.campaigns.empty')} <Link to="/admin/events" className="underline hover:text-primary">{t('dashboard.campaigns.view_all')}</Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {activeEvents.map((event) => (
                                <Card key={event.id} className="flex flex-col hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="line-clamp-1 text-lg">{event.name}</CardTitle>
                                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                                {t('dashboard.campaigns.active')}
                                            </span>
                                        </div>
                                        <CardDescription>{event.status}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{t('dashboard.campaigns.raised')}</span>
                                                <span className="font-medium">{formatCurrency(event.raised || 0)}</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${Math.min(100, ((event.raised || 0) / (event.goalAmount || 1)) * 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{Math.round(((event.raised || 0) / (event.goalAmount || 1)) * 100)}%</span>
                                                <span>{t('dashboard.campaigns.goal', { amount: formatCurrency(event.goalAmount) })}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full" variant="outline">
                                            <Link to={`/admin/events/${event.slug}`}>
                                                {t('dashboard.campaigns.manage')} <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )
                }
            </div >
        </div >
    );
};
