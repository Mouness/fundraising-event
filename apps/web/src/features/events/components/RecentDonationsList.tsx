import { useDonations } from '@features/donation/hooks/useDonations';
import { Loader2, MessageSquare } from 'lucide-react';
import { timeAgo } from '@core/lib/date';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';

interface RecentDonationsListProps {
    eventId: string;
}

export const RecentDonationsList = ({ eventId }: RecentDonationsListProps) => {
    const { t } = useTranslation(['common', 'white-labeling']);
    const { formatCurrency } = useCurrencyFormatter();
    const { donations, isLoading } = useDonations(eventId, 5); // Show last 5

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground italic">
                {t('common.no_results', 'No recent donations.')}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between group transition-all">
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold text-sm leading-none" style={{ color: 'var(--admin-card-text)' }}>
                            {donation.isAnonymous ? t('donation.anonymous', 'Anonymous') : donation.donorName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{timeAgo(donation.createdAt)}</span>
                            <span>•</span>
                            <span className="uppercase">{donation.paymentMethod}</span>
                        </div>
                        {donation.message && (
                            <div className="flex items-center gap-1.5 mt-1 text-xs italic text-muted-foreground bg-muted/50 p-1.5 rounded-md border border-dashed">
                                <MessageSquare className="h-3 w-3" />
                                <p className="line-clamp-1">"{donation.message}"</p>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-base" style={{ color: 'var(--primary)' }}>
                            {formatCurrency(donation.amount / 100, { currency: donation.currency || 'USD' })}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {donation.status}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
