import { useState, useEffect } from 'react';
import type { EventConfig } from '../types/event.config';

// Default fallback config
// Initial empty state (will be populated by fetch)
const INITIAL_STATE: EventConfig = {
    id: '',
    theme: {
        primaryColor: '',
        secondaryColor: '',
        logoUrl: '',
        background: { color: '', gradient: '' }
    },
    content: { title: '', totalLabel: '', goalAmount: 0 },
    donation: {
        form: {
            phone: { enabled: false, required: false },
            message: { enabled: false, required: false },
            anonymous: { enabled: false, required: false }
        },
        sharing: { enabled: false, networks: [] },
        payment: { provider: 'stripe', config: {} }
    }
};

export const useEventConfig = () => {
    const [config, setConfig] = useState<EventConfig>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            const timestamp = Date.now();

            try {
                // Helper to fetch and parse JSON
                const fetchJson = async (url: string) => {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Failed to load ${url}`);
                    return res.json();
                };

                let data;
                try {
                    // 1. Try user config
                    data = await fetchJson(`/config/event-config.json?v=${timestamp}`);
                } catch {
                    // 2. Fallback to default
                    data = await fetchJson(`/config/event-config.default.json?v=${timestamp}`);
                }

                setConfig(data);

                // Inject CSS Variables for theming
                if (data.theme) {
                    const root = document.documentElement;
                    if (data.theme.primaryColor) root.style.setProperty('--primary', data.theme.primaryColor);
                    if (data.theme.secondaryColor) root.style.setProperty('--secondary', data.theme.secondaryColor);

                    if (data.theme.background) {
                        if (data.theme.background.color) root.style.setProperty('--background-color', data.theme.background.color);
                        if (data.theme.background.gradient) root.style.setProperty('--background-gradient', data.theme.background.gradient);
                    }
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
