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
        <div className="px-4 py-2 space-y-3 w-full max-w-sm mx-auto mb-2">
            <div className="space-y-1">
                <Label
                    htmlFor="donor-name"
                    className="text-xs ml-1"
                    style={{ color: 'var(--staff-label-color)' }}
                >
                    Donor Name (Optional)
                </Label>
                <div className="relative">
                    <User
                        className="absolute left-3 top-2.5 h-4 w-4"
                        style={{ color: 'var(--staff-input-text)' }}
                    />
                    <Input
                        id="donor-name"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="John Doe"
                        className="pl-9 h-9 placeholder-[var(--staff-input-placeholder)] placeholder-opacity-60"
                        style={{
                            backgroundColor: 'var(--staff-input-bg)',
                            color: 'var(--staff-input-text)',
                            borderColor: 'var(--staff-input-border)'
                        }}
                        disabled={disabled}
                    />
                </div>
            </div>
            <div className="space-y-1">
                <Label
                    htmlFor="donor-email"
                    className="text-xs ml-1"
                    style={{ color: 'var(--staff-label-color)' }}
                >
                    Email Receipt (Optional)
                </Label>
                <div className="relative">
                    <Mail
                        className="absolute left-3 top-2.5 h-4 w-4"
                        style={{ color: 'var(--staff-input-text)' }}
                    />
                    <Input
                        id="donor-email"
                        type="email"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        placeholder="john@example.com"
                        className="pl-9 h-9 placeholder-[var(--staff-input-placeholder)] placeholder-opacity-60"
                        style={{
                            backgroundColor: 'var(--staff-input-bg)',
                            color: 'var(--staff-input-text)',
                            borderColor: 'var(--staff-input-border)'
                        }}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
};
