import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { type DonationTableData } from '../hooks/useDonationsTable';

interface EditDonationDialogProps {
    donation: DonationTableData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EditDonationDialogInner = ({ donation, open, onOpenChange }: EditDonationDialogProps) => {
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();

    const editDonationSchema = z.object({
        donorName: z.string().min(1, t('validation.required')),
        donorEmail: z.string().email(t('validation.invalid_email')).optional().or(z.literal('')),
        message: z.string().optional(),
        isAnonymous: z.boolean(),
    });

    type EditDonationFormValues = z.infer<typeof editDonationSchema>;

    const form = useForm<EditDonationFormValues>({
        resolver: zodResolver(editDonationSchema),
        values: {
            donorName: donation?.donorName || '',
            donorEmail: donation?.donorEmail || '',
            message: '',
            isAnonymous: donation?.isAnonymous || false,
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: EditDonationFormValues) => {
            if (!donation) throw new Error('No donation selected');
            await api.patch(`/donations/${donation.id}`, values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['donations-table'] });
            toast.success(t('admin_events.donation_modal.success_update'));
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('admin_events.donation_modal.error_update'));
        },
    });

    const onSubmit = (values: EditDonationFormValues) => {
        mutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('admin_events.donation_modal.edit_title')}</DialogTitle>
                    <DialogDescription>
                        {t('admin_events.donation_modal.edit_description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="donorName">{t('admin_events.donation_modal.donor_name')}</Label>
                        <Input id="donorName" {...form.register('donorName')} />
                        {form.formState.errors.donorName && <span className="text-sm text-red-500">{form.formState.errors.donorName.message}</span>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="donorEmail">{t('admin_events.donation_modal.donor_email')}</Label>
                        <Input id="donorEmail" {...form.register('donorEmail')} />
                        {form.formState.errors.donorEmail && <span className="text-sm text-red-500">{form.formState.errors.donorEmail.message}</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isAnonymous"
                            checked={form.watch('isAnonymous')}
                            onCheckedChange={(checked) => form.setValue('isAnonymous', checked as boolean)}
                        />
                        <Label htmlFor="isAnonymous">{t('admin_events.donation_modal.hide_public')}</Label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">{t('admin_events.donation_modal.message')}</Label>
                        <Textarea id="message" {...form.register('message')} placeholder={t('admin_events.donation_modal.message_placeholder')} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('admin_events.donation_modal.save_changes')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export const EditDonationDialog = (props: EditDonationDialogProps) => {
    return <EditDonationDialogInner {...props} />;
};
