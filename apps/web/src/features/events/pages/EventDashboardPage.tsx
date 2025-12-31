import { useEvent } from '@/features/events/context/EventContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Users, TrendingUp, Calendar } from 'lucide-react';

export const EventDashboardPage = () => {
    const { event } = useEvent();

    if (!event) return null;

    const raised = event.raised || 0;
    const goal = event.goalAmount || 1;
    const progress = Math.min(100, Math.round((raised / goal) * 100));
    const donors = event.donorCount || 0;
    const status = event.status?.toUpperCase() || 'DRAFT';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--admin-heading-color)' }}
                    >
                        {event.name}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Dashboard Overview
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(raised)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {progress}% of goal
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Donors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {donors}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Unique contributors
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Goal</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Target amount
                        </p>
                    </CardContent>
                </Card>

                <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Event Date</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold" style={{ color: 'var(--admin-card-text)' }}>
                            {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {status}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* TODO: Recent Donations Table specific to this event */}
            <Card className="col-span-4" style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        Latest donations for {event.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        Statistics Chart Coming Soon
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
