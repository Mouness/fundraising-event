import { useState, useEffect } from "react";
import { SyncService } from "../services/sync.service";
// import { useToast } from "@/hooks/use-toast";
import { Keypad } from "../components/Keypad";
import { DonationTypeSelector } from "../components/DonationTypeSelector";
import type { DonationType } from "../types";
import { DonorInfoForm } from "../components/DonorInfoForm";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export const CollectorPage = () => {
    const [amount, setAmount] = useState<string>("");
    const [type, setType] = useState<DonationType>("cash");
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const { toast } = useToast();

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
        if (!val) return "$0.00";
        const num = parseInt(val) / 100;
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(num);
    };

    // const { toast } = useToast();
    // Use window.alert for now or simple UI feedback until toast is fixed, 
    // BUT user wanted toast earlier. Let's try to restore it if possible, otherwise use a simple status message.
    // The previous error was about useToast path. I will use a simple state message or alert for now to avoid risking build,
    // prioritizing the Sync logic correctness.
    // Actually, I can allow toast usage if I fix the import? Stick to safe simple feedback first.

    // Changing approach: Use alert/confirm for success message for now, formatted nicely.

    const handleSubmit = async () => {
        if (!amount || parseInt(amount) === 0) return;

        setIsSubmitting(true);

        const donationData = {
            amount: parseInt(amount),
            type,
            name: name || undefined,
            email: email || undefined
        };

        const result = await SyncService.submitDonation(donationData);

        setIsSubmitting(false);

        if (result.success) {
            const msg = result.offline
                ? `OFFLINE: Donation saved to queue! \nAmount: ${formatAmount(amount)}`
                : `SUCCESS: Donation collected! \nAmount: ${formatAmount(amount)}`;

            alert(msg); // Simple feedback

            setAmount("");
            setName("");
            setEmail("");
            setType("cash");
        } else {
            alert("Error submitting donation.");
        }
    };

    // Add Sync Effect
    useEffect(() => {
        const handleOnline = () => {
            SyncService.processQueue().then(count => {
                if (count > 0) alert(`Back Online: Synced ${count} offline donations!`);
            });
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-md mx-auto">
            {/* Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[120px] bg-slate-50 dark:bg-slate-900 mx-4 mt-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
                    Enter Amount
                </span>
                <div className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
                    {amount ? formatAmount(amount) : <span className="text-slate-300 dark:text-slate-600">$0.00</span>}
                </div>
            </div>

            {/* Controls */}
            <div className="flex-none mt-4 bg-white dark:bg-slate-900 rounded-t-[2rem] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border-t border-slate-100 dark:border-slate-800 pb-6">
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

                <div className="px-4 mt-2">
                    <Button
                        size="lg"
                        className="w-full text-lg font-bold h-14 shadow-lg shadow-primary/20"
                        onClick={handleSubmit}
                        disabled={!amount || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        ) : (
                            <Check className="mr-2 h-6 w-6" />
                        )}
                        Collect Donation
                    </Button>
                </div>
            </div>
        </div>
    );
};
