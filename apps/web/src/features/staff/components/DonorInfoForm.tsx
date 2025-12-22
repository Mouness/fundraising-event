import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail } from "lucide-react";

interface DonorInfoFormProps {
    name: string;
    email: string;
    onNameChange: (val: string) => void;
    onEmailChange: (val: string) => void;
    disabled?: boolean;
}

export const DonorInfoForm = ({ name, email, onNameChange, onEmailChange, disabled }: DonorInfoFormProps) => {
    return (
        <div className="px-4 py-2 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg mx-4 mb-2 border border-slate-100 dark:border-slate-700">
            <div className="space-y-1">
                <Label htmlFor="donor-name" className="text-xs text-muted-foreground ml-1 dark:text-slate-400">Donor Name (Optional)</Label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground dark:text-slate-400" />
                    <Input
                        id="donor-name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="John Doe"
                        className="pl-9 h-9 bg-white dark:bg-black border-slate-200 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600"
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="space-y-1">
                <Label htmlFor="donor-email" className="text-xs text-muted-foreground ml-1 dark:text-slate-400">Email Receipt (Optional)</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground dark:text-slate-400" />
                    <Input
                        id="donor-email"
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="john@example.com"
                        className="pl-9 h-9 bg-white dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
};
