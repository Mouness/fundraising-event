import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { type DonationTableData } from '../hooks/useDonationsTable';

interface CancelDonationDialogProps {
    donation: DonationTableData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CancelDonationDialog = ({ donation, open, onOpenChange }: CancelDonationDialogProps) => {
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const [shouldRefund, setShouldRefund] = useState(false);

    const mutation = useMutation({
        mutationFn: async () => {
            if (!donation) throw new Error('No donation selected');
            await api.post(`/donations/${donation.id}/cancel`, { shouldRefund });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donations-table'] });
            toast.success(shouldRefund ? t('admin_events.donation_modal.success_refund') : t('admin_events.donation_modal.success_cancel'));
            onOpenChange(false);
            setShouldRefund(false);
        },
        onError: (error: unknown) => {
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(msg || t('admin_events.donation_modal.error_cancel'));
        },
    });

    const isStripe = donation?.paymentMethod === 'stripe';
    const amount = donation ? new Intl.NumberFormat('en-US', { style: 'currency', currency: donation.currency }).format(donation.amount) : '';
    const donor = donation?.donorName || t('donation.anonymous');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {t('admin_events.donation_modal.cancel_title')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('admin_events.donation_modal.cancel_description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="mb-4 text-sm font-medium">
                        {t('admin_events.donation_modal.summary', { amount, donor })}
                    </p>

                    {isStripe && (
                        <div className="flex items-start space-x-2 p-4 border rounded-md bg-muted/50">
                            <Checkbox
                                id="refund"
                                checked={shouldRefund}
                                onCheckedChange={(checked) => setShouldRefund(checked as boolean)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="refund" className="font-medium cursor-pointer">
                                    {t('admin_events.donation_modal.refund_stripe')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t('admin_events.donation_modal.refund_desc')}
                                </p>
                            </div>
                        </div>
                    )}

                    {!isStripe && (
                        <div className="text-sm text-muted-foreground italic">
                            {t('admin_events.donation_modal.offline_refund_notice')}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t('admin_events.donation_modal.keep')}</Button>
                    <Button
                        variant="destructive"
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate()}
                    >
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {shouldRefund ? t('admin_events.donation_modal.refund_and_cancel') : t('admin_events.donation_modal.cancel_only')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
