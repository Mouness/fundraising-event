import { Card, CardHeader, CardTitle, CardContent } from '@core/components/ui/card'
import { Activity, CreditCard, Users, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DASHBOARD_STATS } from '@features/admin/mocks/dashboard'

export const DashboardStats = () => {
    const { t } = useTranslation('common')

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-card-text)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('dashboard.stats.total_revenue')}
                    </CardTitle>
                    <CreditCard className="h-4 w-4" style={{ color: 'var(--admin-muted-text)' }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{DASHBOARD_STATS.totalRevenue.value}</div>
                    <p className="text-xs" style={{ color: 'var(--admin-muted-text)' }}>
                        {DASHBOARD_STATS.totalRevenue.change} {DASHBOARD_STATS.totalRevenue.period}
                    </p>
                </CardContent>
            </Card>
            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-card-text)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('dashboard.stats.active_events')}
                    </CardTitle>
                    <Calendar className="h-4 w-4" style={{ color: 'var(--admin-muted-text)' }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{DASHBOARD_STATS.activeEvents.value}</div>
                    <p className="text-xs" style={{ color: 'var(--admin-muted-text)' }}>
                        {DASHBOARD_STATS.activeEvents.change} {DASHBOARD_STATS.activeEvents.period}
                    </p>
                </CardContent>
            </Card>
            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-card-text)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('dashboard.stats.donations')}
                    </CardTitle>
                    <Activity className="h-4 w-4" style={{ color: 'var(--admin-muted-text)' }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{DASHBOARD_STATS.donations.value}</div>
                    <p className="text-xs" style={{ color: 'var(--admin-muted-text)' }}>
                        {DASHBOARD_STATS.donations.change} {DASHBOARD_STATS.donations.period}
                    </p>
                </CardContent>
            </Card>
            <Card
                style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    color: 'var(--admin-card-text)',
                    borderColor: 'var(--admin-border-color)',
                }}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {t('dashboard.stats.staff_members')}
                    </CardTitle>
                    <Users className="h-4 w-4" style={{ color: 'var(--admin-muted-text)' }} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{DASHBOARD_STATS.staffMembers.value}</div>
                    <p className="text-xs" style={{ color: 'var(--admin-muted-text)' }}>
                        {DASHBOARD_STATS.staffMembers.change} {DASHBOARD_STATS.staffMembers.period}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
