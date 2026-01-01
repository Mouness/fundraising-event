import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEvents } from '@/features/events/hooks/useEvents';
import { Loader2, TrendingUp, Users, Calendar, ArrowRight, FileText } from 'lucide-react';
import { api } from '@/lib/api';

export const DashboardPage = () => {
    const { t } = useTranslation('common');
    const { events, isLoading } = useEvents();

    const handleExportReceipts = async () => {
        try {
            const response = await api.get('/export/receipts/zip', {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipts-all-${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Receipt export failed', error);
            alert(t('dashboard.export_failed', 'Failed to export receipts. Please try again.'));
        }
    };

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

    // Currency Formatter
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

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
                        {t('dashboard.platform_overview', 'Platform Overview')}
                    </p>
                </div>
                <Button variant="outline" onClick={handleExportReceipts}>
                    <FileText className="mr-2 h-4 w-4" />
                    {t('dashboard.export_receipts', 'Export Receipts (ZIP)')}
                </Button>
            </div>

            {/* Global Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.stats.revenue', 'Total Revenue')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {formatCurrency(totalRaised)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.stats.events_count', { count: events.length, defaultValue: `Across ${events.length} events` })}
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.stats.active_events', 'Active Events')}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {activeEventsCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.stats.currently_live', 'Currently live')}
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('dashboard.stats.total_donors', 'Total Donors')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {totalDonors}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('dashboard.stats.donors_description', 'Lifetime unique donors')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Events Grid */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-tight">{t('dashboard.campaigns.title', 'Active Campaigns')}</h3>
                {activeEvents.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                        {t('dashboard.campaigns.empty', 'No active events found.')} <Link to="/admin/events" className="underline hover:text-primary">{t('dashboard.campaigns.view_all', 'View all events')}</Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {activeEvents.map((event) => (
                            <Card key={event.id} className="flex flex-col hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="line-clamp-1 text-lg">{event.name}</CardTitle>
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                            {t('dashboard.campaigns.active', 'Active')}
                                        </span>
                                    </div>
                                    <CardDescription>{event.status}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{t('dashboard.campaigns.raised', 'Raised')}</span>
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
                                            <span>{t('dashboard.campaigns.goal', { amount: formatCurrency(event.goalAmount), defaultValue: `Goal: ${formatCurrency(event.goalAmount)}` })}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full" variant="outline">
                                        <Link to={`/admin/events/${event.slug}`}>
                                            {t('dashboard.campaigns.manage', 'Manage Dashboard')} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
