export interface EventConfig {
    /** Unique identifier for the event */
    id: string;

    /** URL slug for the event */
    slug?: string;

    /** Visual theme configuration */
    /** Visual theme configuration */
    theme?: {
        /** Generic assets map (e.g. logo, background) */
        assets?: Record<string, string>;
        /** Generic CSS variables map (e.g. --primary, --radius) */
        variables?: Record<string, string>;
    };

    /** Text content configuration */
    content: {
        /** Main title of the event */
        title: string;
        /** Label for the total raised amount (e.g. "Total Raised") */
        totalLabel: string;
        /** Fundraising goal amount in dollars */
        goalAmount: number;
        /** Landing page configuration (features, footer links) */
        landing?: {
            impact?: { url?: string; enabled?: boolean };
            community?: { url?: string; enabled?: boolean };
            interactive?: { url?: string; enabled?: boolean };
        };
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
    /** Unified Communication configuration (Email & PDF) */
    communication: {
        /** Organization Details */
        legalName: string;
        address: string;
        website?: string;
        supportEmail?: string;

        /** PDF Specifics */
        pdf: {
            enabled: boolean;
            footerText?: string;
            templateStyle?: 'minimal' | 'formal';
        };

        /** Email Specifics */
        email: {
            enabled: boolean;
            subjectLine?: string;
            footerText?: string;
        };
    };

    /** Generic feature flags and non-visual settings */
    settings?: Record<string, any>;

    /** Flat-map for localization overrides (e.g. { "en.donation.title": "Give Now" }) */
    locales?: Record<string, string>;
}
