import { useState, useEffect } from 'react';
import { loadConfig } from '@fundraising/white-labeling';
import type { EventConfig } from '@fundraising/white-labeling';

// Default fallback config
const INITIAL_STATE = loadConfig();

export const useEventConfig = () => {
    const [config, setConfig] = useState<EventConfig>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            const timestamp = Date.now();

            try {
                // Fetch runtime override (e.g. from CMS or server-generated file)
                // We no longer fetch the default JSON, as it's bundled in the code.
                const res = await fetch(`/config/event-config.json?v=${timestamp}`);
                if (res.ok) {
                    const customConfig = await res.json();
                    // Smart merge logic is handled by the package
                    setConfig(loadConfig(customConfig));
                } else {
                    // Just use default
                    setConfig(loadConfig());
                }
            } catch (error) {
                console.warn('No custom event config found, using defaults.');
                setConfig(loadConfig());
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return { config, isLoading };
}
