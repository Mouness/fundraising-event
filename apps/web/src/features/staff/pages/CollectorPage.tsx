import { useState, useEffect } from "react";
import { SyncService } from "@features/staff/services/sync.service";
import { useStaffAuth } from "../hooks/useStaffAuth";

import { Keypad } from "../components/Keypad";
import { DonationTypeSelector } from "../components/DonationTypeSelector";
import type { DonationType } from "../types";
import { DonorInfoForm } from "../components/DonorInfoForm";
import { Button } from "@core/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCurrencyFormatter } from "@core/hooks/useCurrencyFormatter";
import { useNavigate, useParams } from "react-router-dom";
import { useEvent } from "@features/events/context/EventContext";

export const CollectorPage = () => {
    const { t } = useTranslation('common');
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { event } = useEvent();
    const { getStaffUser, isStaffAuthenticated } = useStaffAuth();
    const { formatCurrency } = useCurrencyFormatter();

    useEffect(() => {
        if (event && !isStaffAuthenticated(event.id)) {
            navigate(`/${slug}/staff/login`);
        }
    }, [event, isStaffAuthenticated, navigate, slug]);

    const [amount, setAmount] = useState<string>("");
    const [type, setType] = useState<DonationType>("cash");
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleKeyPress = (key: string) => {
        if (amount.length >= 8) return;
        if (key === "0" && amount === "0") return;
        if (key === "00" && (amount === "" || amount === "0")) return;
        setAmount((prev) => prev + key);
    };

    const handleDelete = () => {
        setAmount((prev) => prev.slice(0, -1));
    };

    const handleClear = () => {
        setAmount("");
        setName("");
        setEmail("");
        setType("cash");
    };

    const formatAmount = (val: string) => {
        if (!val) return formatCurrency(0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const num = parseInt(val) / 100;
        return formatCurrency(num, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };



    const handleSubmit = async () => {
        if (!amount || parseInt(amount) === 0) return;

        setIsSubmitting(true);

        const donationData = {
            amount: parseInt(amount),
            type,
            name: name || undefined,
            email: email || undefined
        };

        const staffUser = getStaffUser();
        if (!staffUser?.eventId) {
            toast.error(t('staff.session_invalid', "Session invalid. Please login again."));
            return;
        }

        const result = await SyncService.submitDonation(donationData, staffUser.eventId);

        setIsSubmitting(false);

        if (result.success) {
            const formattedAmount = formatAmount(amount);
            const msg = result.offline
                ? t('staff.success_offline', { amount: formattedAmount })
                : t('staff.success_online', { amount: formattedAmount });

            toast.success(msg);

            setAmount("");
            setName("");
            setEmail("");
            setType("cash");
        } else {
            toast.error(result.error || t('staff.submit_error'));
        }
    };

    // Add Sync Effect
    useEffect(() => {
        const handleOnline = () => {
            SyncService.processQueue().then(count => {
                if (count > 0) toast.success(t('staff.back_online', { count }));
            });
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [t]);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-md mx-auto">
            {/* Display Area */}
            <div
                className="flex-1 flex flex-col items-center justify-center min-h-[120px] mx-4 mt-4 border shadow-inner"
                style={{
                    backgroundColor: 'var(--staff-display-bg)',
                    borderColor: 'var(--staff-display-border)',
                    borderRadius: 'var(--staff-display-radius)'
                }}
            >
                <span
                    className="text-sm font-medium uppercase tracking-widest mb-1"
                    style={{ color: 'var(--staff-label-color)' }}
                >
                    {t('staff.enter_amount')}
                </span>
                <div
                    className="font-bold tracking-tighter"
                    style={{ fontSize: 'var(--staff-amount-size)', color: 'var(--staff-amount-color)' }}
                >
                    {amount ? formatAmount(amount) : <span style={{ color: 'var(--staff-amount-placeholder-color)', opacity: 0.4 }}>{formatCurrency(0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
                </div>
            </div>

            {/* Controls */}
            <div
                className="flex-none mt-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border-t pb-6"
                style={{
                    backgroundColor: 'var(--staff-keypad-bg)',
                    borderColor: 'var(--staff-display-border)',
                    borderRadius: 'var(--staff-keypad-radius)',
                    boxShadow: 'var(--staff-keypad-shadow)'
                }}
            >
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-3" />

                <DonationTypeSelector
                    value={type}
                    onChange={setType}
                    disabled={isSubmitting}
                />

                <DonorInfoForm
                    name={name}
                    email={email}
                    onNameChange={setName}
                    onEmailChange={setEmail}
                    disabled={isSubmitting}
                />

                <Keypad
                    onKeyPress={handleKeyPress}
                    onDelete={handleDelete}
                    onClear={handleClear}
                    disabled={isSubmitting}
                />

                <div className="px-4 mt-2 w-full max-w-sm mx-auto">
                    <Button
                        size="lg"
                        className="w-full text-lg font-bold h-14"
                        onClick={handleSubmit}
                        disabled={!amount || isSubmitting}
                        style={{
                            backgroundColor: 'var(--staff-type-button-selected-bg)',
                            color: 'var(--staff-type-button-selected-text)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" style={{ color: 'var(--staff-type-button-selected-icon)' }} />
                        ) : (
                            <Check className="mr-2 h-6 w-6" style={{ color: 'var(--staff-type-button-selected-icon)' }} />
                        )}
                        {t('staff.collect_button')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
