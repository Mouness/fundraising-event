export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface EventConfig {
    /** Unique identifier for the event */
    id: string;

    /** Visual theme configuration */
    theme: {
        /** Primary brand color (hex) */
        primaryColor: string;
        /** Secondary accent color (hex) */
        secondaryColor: string;
        /** URL to the logo image */
        logoUrl?: string;
        /** Background style configuration */
        background?: {
            /** Solid background color (hex/rgb) */
            color?: string;
            /** CSS gradient string (e.g. "linear-gradient(...)") */
            gradient?: string;
        };
    };

    /** Text content configuration */
    content: {
        /** Main title of the event */
        title: string;
        /** Label for the total raised amount (e.g. "Total Raised") */
        totalLabel: string;
        /** Fundraising goal amount in dollars */
        goalAmount: number;
    };

    /** Donation flow configuration */
    donation: {
        /** Form field toggles */
        form: {
            /** Collect donor phone number */
            phone: { enabled: boolean; required: boolean };
            /** Collect donor message/comment */
            message: { enabled: boolean; required: boolean };
            /** Allow anonymous donations */
            anonymous: { enabled: boolean; required: boolean };
        };

        /** Social media sharing configuration */
        sharing: {
            enabled: boolean;
            /** List of enabled specialized sharing buttons */
            networks: ('facebook' | 'twitter' | 'linkedin')[];
        };

        /** Payment provider configuration */
        payment: {
            provider: 'stripe' | 'paypal' | string;
            /** Provider-specific config (public keys, etc.) */
            config?: Record<string, any>;
        };
    };
}
