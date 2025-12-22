export interface EventConfig {
    /** Unique identifier for the event */
    id: string;

    /** Visual theme configuration */
    theme: {
        /** URL to the logo image */
        logoUrl?: string;
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
