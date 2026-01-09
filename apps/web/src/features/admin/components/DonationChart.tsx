import { useMemo } from 'react';
import { useDonations } from '@features/donation/hooks/useDonations';
import { Card, CardHeader, CardTitle, CardContent } from '@core/components/ui/card';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import { Loader2 } from 'lucide-react';

export const DonationChart = () => {
    const { t } = useTranslation('common');
    const { donations, isLoading } = useDonations(undefined, 1000); // Fetch enough to aggregate
    const { formatCurrency } = useCurrencyFormatter();

    const data = useMemo(() => {
        if (!donations.length) return [];

        // Group by date (last 30 days usually, but we'll map what we have)
        const grouped = donations.reduce((acc, donation) => {
            // Use ISO string YYYY-MM-DD for stable grouping and sorting
            const dateKey = new Date(donation.createdAt).toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + Number(donation.amount);
            return acc;
        }, {} as Record<string, number>);

        const sorted = Object.entries(grouped)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // ISO strings sort correctly
            .map(([dateKey, amount]) => ({
                date: new Date(dateKey).toLocaleDateString(), // Format for display
                rawDate: dateKey,
                amount: amount / 100 // Convert cents to units
            }))
            .slice(-30);

        return sorted;
    }, [donations]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card style={{ backgroundColor: 'var(--admin-card-bg)', borderColor: 'var(--admin-border-color)' }}>
            <CardHeader>
                <CardTitle>{t('dashboard.stats.revenue_trend', 'Revenue Trend')}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="date"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`} // Simplified, ideally currency symbol
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--muted)' }}
                                contentStyle={{
                                    backgroundColor: 'var(--popover)',
                                    borderColor: 'var(--border)',
                                    borderRadius: 'var(--radius)',
                                    color: 'var(--popover-foreground)'
                                }}
                                formatter={(value: any) => [formatCurrency(Number(value || 0)), t('common.amount')]}
                            />
                            <Bar
                                dataKey="amount"
                                fill="var(--primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
