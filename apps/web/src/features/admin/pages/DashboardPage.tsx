import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DashboardStats } from '../components/DashboardStats';
import { useTranslation } from 'react-i18next';
import { RECENT_DONATIONS, SALES_SUMMARY } from '@/mock/dashboard';

export const DashboardPage = () => {
    const { t } = useTranslation('common');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
            </div>

            <DashboardStats />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('dashboard.overview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            {t('dashboard.chart_placeholder')}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('dashboard.recent_donations')}</CardTitle>
                        <CardDescription>
                            You made {SALES_SUMMARY.count} sales {SALES_SUMMARY.period}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {RECENT_DONATIONS.map((donation: any, index: number) => (
                                <div className="flex items-center" key={index}>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{donation.name}</p>
                                        <p className="text-sm text-muted-foreground">{donation.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium">{donation.amount}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
