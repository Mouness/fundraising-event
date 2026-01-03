import { useEvent } from '@/features/events/context/EventContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Users, TrendingUp, Calendar, ExternalLink, Settings, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RecentDonationsList } from '../components/RecentDonationsList';
import { useTranslation } from 'react-i18next';

export const EventDashboardPage = () => {
    const { event } = useEvent();
    const { t } = useTranslation('common');

    if (!event) return null;

    const raised = event.raised || 0;
    const goal = event.goalAmount || 1;
    const progress = Math.min(100, Math.round((raised / goal) * 100));
    const donors = event.donorCount || 0;
    // const status = event.status?.toUpperCase() || 'DRAFT';
    // Using translation for status would require mapping, for now let's keep it simple or allow backend string if it matches key

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--admin-heading-color)' }}
                    >
                        {event.name}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        {t('admin_events.dashboard.overview')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link to={`/admin/events/${event.slug}/settings`}>
                            <Settings className="mr-2 h-4 w-4" />
                            {t('nav.settings')}
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to={`/${event.slug}/staff`} target="_blank">
                            <Smartphone className="mr-2 h-4 w-4" />
                            {t('admin_events.dashboard.collector_app')}
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link to={`/${event.slug}/live`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t('admin_events.dashboard.launch_live')}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin_events.total_raised')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(raised)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('admin_events.dashboard.progress_of_goal', { progress })}
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin_events.donors')}</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {donors}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('admin_events.dashboard.unique_contributors')}
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin_events.goal')}</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('admin_events.dashboard.target_amount')}
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('admin_events.event_date')}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {event.status}
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Donations List */}
            <Card className="col-span-4" style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>{t('dashboard.recent_donations')}</CardTitle>
                    <CardDescription>
                        {t('admin_events.dashboard.latest_transactions_for', { name: event.name })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RecentDonationsList eventId={event.id} />
                </CardContent>
            </Card>
        </div>
    );
};
