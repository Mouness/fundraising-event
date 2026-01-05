export interface ThemeVariable {
    key: string;
    value: string;
}

export interface GlobalSettingsForm {
    // Isolated Identity
    organization: string;
    logo: string;
    email: string; // communication.supportEmail
    address: string;
    phone: string; // Custom/generic
    website: string;

    themeVariables: ThemeVariable[];
    commonVariables: {
        primary: string;
        background: string;
        foreground: string;
        muted: string;
        mutedForeground: string;
        card: string;
        cardForeground: string;
        popover: string;
        popoverForeground: string;
        primaryForeground: string;
        border: string;
        input: string;
        ring: string;
        radius: string;
        radiusSm: string;
        radiusLg: string;
        secondary: string;
        secondaryForeground: string;
        accent: string;
        accentForeground: string;
        destructive: string;
        destructiveForeground: string;
    };

    // Modules
    event: { totalLabel: string };
    payment: { currency: string, provider: string, config?: Record<string, unknown> };
    locales: { default: string, supported: string[] };

    // Communication Details
    emailReceipt: { enabled: boolean, senderName: string, replyTo: string, subjectLine: string, footerText: string };
    pdfReceipt: { enabled: boolean, footerText: string, templateStyle: 'minimal' | 'formal' };
    sharing: { enabled: boolean, networks: ('facebook' | 'twitter' | 'linkedin')[] };

    assets: {
        favicon: string;
        backgroundDonor: string;
        backgroundLive: string;
        backgroundLanding: string;
    };
}
