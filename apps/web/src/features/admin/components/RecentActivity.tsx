import { useDonations } from '@features/donation/hooks/useDonations'
import { Card, CardHeader, CardTitle, CardContent } from '@core/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter'
import { Loader2, DollarSign } from 'lucide-react'

export const RecentActivity = () => {
    const { t } = useTranslation('common')
    const { donations, isLoading } = useDonations(undefined, 6) // Fetch latest 6
    const { formatCurrency } = useCurrencyFormatter()

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card
            style={{
                backgroundColor: 'var(--admin-card-bg)',
                borderColor: 'var(--admin-border-color)',
            }}
        >
            <CardHeader>
                <CardTitle>{t('dashboard.activity.title', 'Recent Activity')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {donations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t('dashboard.activity.empty', 'No recent activity')}
                        </p>
                    ) : (
                        donations.map((donation) => (
                            <div key={donation.id} className="flex items-center">
                                <div className="h-9 w-9 rounded-full flex items-center justify-center relative">
                                    <div
                                        className="absolute inset-0 rounded-full opacity-10"
                                        style={{ backgroundColor: 'var(--primary)' }}
                                    />
                                    <DollarSign
                                        className="h-4 w-4 relative"
                                        style={{ color: 'var(--primary)' }}
                                    />
                                </div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {donation.isAnonymous
                                            ? t('common.anonymous', 'Anonymous')
                                            : donation.donorName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(donation.createdAt).toLocaleDateString()} •{' '}
                                        {new Date(donation.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div
                                    className="ml-auto font-medium"
                                    style={{ color: 'var(--global-success-color)' }}
                                >
                                    +{formatCurrency(Number(donation.amount) / 100)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
