import { useState, useEffect } from 'react';

export interface EventConfig {
    id: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        logoUrl?: string;
    };
    content: {
        title: string;
        totalLabel: string;
        goalAmount: number; // in dollars
    };
    features: {
        phone: { enabled: boolean; required: boolean };
        message: { enabled: boolean; required: boolean };
        anonymous: { enabled: boolean; required: boolean };
    };
    social?: {
        sharing: {
            enabled: boolean;
            networks: ('facebook' | 'twitter' | 'linkedin')[];
        };
    };
    payment: {
        provider: 'stripe' | 'paypal' | string;
        config?: Record<string, any>;
    };
}

// Default fallback config
// Initial empty state (will be populated by fetch)
const INITIAL_STATE: EventConfig = {
    id: '',
    theme: { primaryColor: '', secondaryColor: '', logoUrl: '' },
    content: { title: '', totalLabel: '', goalAmount: 0 },
    features: {
        phone: { enabled: false, required: false },
        message: { enabled: false, required: false },
        anonymous: { enabled: false, required: false }
    },
    payment: { provider: 'stripe', config: {} }
};

export const useEventConfig = () => {
    const [config, setConfig] = useState<EventConfig>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // 1. Try user config
                let response = await fetch('/config/event-config.json');

                // 2. Fallback to default config file
                if (!response.ok) {
                    response = await fetch('/config/event-config.default.json');
                }

                if (response.ok) {
                    const data = await response.json();

                    setConfig(data);

                    // Inject CSS Variables for theming (Visual feedback)
                    const root = document.documentElement;
                    if (data.theme?.primaryColor) root.style.setProperty('--primary', data.theme.primaryColor);
                    if (data.theme?.secondaryColor) root.style.setProperty('--secondary', data.theme.secondaryColor);
                }
            } catch (error) {
                console.error('Failed to load event config:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return { config, isLoading };
}
