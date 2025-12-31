import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { DashboardStats } from '../components/DashboardStats';
import { useTranslation } from 'react-i18next';
import { RECENT_DONATIONS, SALES_SUMMARY } from '@/mock/dashboard';

import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const DashboardPage = () => {
    const { t } = useTranslation('common');

    const exportMutation = useMutation({
        mutationFn: async () => {
            const response = await api.get('/export/receipts/zip', {
                responseType: 'blob',
            });
            return response.data;
        },
        onSuccess: (data) => {
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'receipts.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            console.log('Donation receipts exported successfully');
        },
        onError: (error) => {
            console.error('Export failed', error);
            alert('Failed to export receipts');
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: 'var(--admin-heading-color)' }}
                >
                    {t('dashboard.title')}
                </h2>
                <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
                    {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export Receipts (ZIP)
                </Button>
            </div>

            <DashboardStats />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card
                    className="col-span-4"
                    style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        color: 'var(--admin-card-text)',
                        borderColor: 'var(--admin-border-color)'
                    }}
                >
                    <CardHeader>
                        <CardTitle>{t('dashboard.overview')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div
                            className="h-[200px] flex items-center justify-center"
                            style={{ color: 'var(--admin-muted-text)' }}
                        >
                            {t('dashboard.chart_placeholder')}
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className="col-span-3"
                    style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        color: 'var(--admin-card-text)',
                        borderColor: 'var(--admin-border-color)'
                    }}
                >
                    <CardHeader>
                        <CardTitle>{t('dashboard.recent_donations')}</CardTitle>
                        <CardDescription>
                            You made {SALES_SUMMARY.count} sales {SALES_SUMMARY.period}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {RECENT_DONATIONS.map((donation, index) => (
                                <div className="flex items-center" key={index}>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{donation.name}</p>
                                        <p className="text-sm" style={{ color: 'var(--admin-muted-text)' }}>{donation.email}</p>
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
