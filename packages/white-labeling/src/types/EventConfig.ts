import { SupportedLocale } from './locales';

export interface EventConfig {
    /** Unique identifier for the event */
    id: string;

    /** URL slug for the event */
    slug?: string;

    /** Name of the event (System/DB) */
    name: string;

    /** Description of the event (System/DB) */
    description?: string;

    /** Visual theme configuration */
    theme?: {
        /** Generic assets map (e.g. logo, background) */
        assets?: Record<string, string>;
        /** Generic CSS variables map (e.g. --primary, --radius) */
        variables?: Record<string, string>;
    };

    /** Text content configuration */
    content: {
        /** Main title of the event (Display Override) - defaults to event.name */
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

    /** Live Page Configuration */
    live?: {
        /** Visual Theme Proposal */
        theme: 'classic' | 'modern' | 'elegant';
    };

    /** Donation flow configuration */
    donation: {
        /** Form field toggles */
        form: {
            /** Collect donor phone number */
            phone: { enabled: boolean; required: boolean };
            /** Collect donor address */
            address: { enabled: boolean; required: boolean };
            /** Collect company name */
            company: { enabled: boolean; required: boolean };
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
            /** Currency code (e.g. USD, EUR) */
            currency: string;
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
        phone?: string;

        /** PDF Specifics */
        pdf: {
            enabled: boolean;
            footerText?: string;
            templateStyle?: 'minimal' | 'formal';
        };

        /** Email Specifics */
        email: {
            enabled: boolean;
            senderName?: string;
            replyTo?: string;
            subjectLine?: string;
            footerText?: string;
        };
    };

    /** Localization overrides */
    locales?: {
        default: SupportedLocale;
        supported: SupportedLocale[];
        /** Key-value overrides for translations */
        overrides?: Record<string, any>;
    };
}

