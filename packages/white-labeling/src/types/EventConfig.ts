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

    theme?: ThemeConfig;
    content: ContentConfig;
    live?: LiveConfig;
    donation: DonationConfig;
    communication: CommunicationConfig;
    locales?: LocalesConfig;
}

/** Visual theme configuration */
export interface ThemeConfig {
    /** Generic assets map (e.g. logo, background) */
    assets?: Record<string, string>;
    /** Generic CSS variables map (e.g. --primary, --radius) */
    variables?: Record<string, string>;
}

/** Text content configuration */
export interface ContentConfig {
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
}

/** Live Page Configuration */
export interface LiveConfig {
    /** Visual Theme Proposal */
    theme: 'classic' | 'modern' | 'elegant';
}

/** Donation flow configuration */
export interface DonationConfig {
    /** Form field toggles */
    form: {
        /** Collect donor phone number */
        phone: DonationFormFieldConfig;
        /** Collect donor address */
        address: DonationFormFieldConfig;
        /** Collect company name */
        company: DonationFormFieldConfig;
        /** Collect donor message/comment */
        message: DonationFormFieldConfig;
        /** Allow anonymous donations */
        anonymous: DonationFormFieldConfig;
    };
    sharing: SharingConfig;
    payment: PaymentConfig;
}

/** Social media sharing configuration */
export interface SharingConfig {
    enabled: boolean;
    /** List of enabled specialized sharing buttons */
    networks: ('facebook' | 'twitter' | 'linkedin')[];
}

/** Form field configuration */
export interface DonationFormFieldConfig {
    enabled: boolean;
    required: boolean;
}

/** Stripe-specific config */
export interface StripeProviderConfig {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
}

/** PayPal-specific config */
export interface PayPalProviderConfig {
    clientId: string;
    clientSecret: string;
    webhookId: string;
    sandbox: boolean;
}

/** Payment provider configuration */
export interface PaymentConfig {
    provider: 'stripe' | 'paypal' | string;
    /** Currency code (e.g. USD, EUR) */
    currency: string;
    /** Provider-specific config (public keys, etc.) */
    config?: {
        stripe?: StripeProviderConfig;
        paypal?: PayPalProviderConfig;
    };
}

/** Unified Communication configuration (Email & PDF) */
export interface CommunicationConfig {
    /** Organization Details */
    legalName: string;
    taxId?: string; // Tax ID / Charity Registration Number
    address: string;
    website?: string;
    supportEmail?: string;
    phone?: string;
    footerText?: string; // footer text for receipts
    signatureText?: string; // e.g. "CEO Name, Title"
    signatureImage?: string; // URL to signature image

    pdf: PdfConfig;
    email: EmailConfig;
}

/** PDF template configuration */
export interface PdfConfig {
    enabled: boolean;
}

/** Email receipt configuration */
export interface EmailConfig {
    enabled: boolean;
    senderName?: string;
    replyTo?: string;
    subjectLine?: string;
    provider?: 'console' | 'smtp' | 'resend' | 'gmail' | 'outlook';
    config?: EmailProviderConfig;
}

export interface EmailProviderConfig {
    smtp?: {
        host: string;
        port: number;
        secure: boolean;
        auth?: {
            user: string;
            pass: string;
        };
    };
}

/** Localization configuration */
export interface LocalesConfig {
    default: SupportedLocale;
    supported: SupportedLocale[];
    /** Key-value overrides for translations */
    overrides?: Record<string, any>;
}


