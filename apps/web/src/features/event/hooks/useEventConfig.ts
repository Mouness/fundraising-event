
import { useState, useEffect } from 'react';
import {
    initWhiteLabeling,
    loadConfigs,
    loadAssets,
    loadTheme
} from '@fundraising/white-labeling';
import type { EventConfig } from '@fundraising/white-labeling';
import { API_URL } from '@/lib/api';

// Initial state must be a full EventConfig compliant object
// defaults are available synchronously via loaders when store is empty
const INITIAL_STATE: EventConfig = {
    ...loadConfigs(),
    theme: {
        assets: loadAssets(),
        variables: loadTheme()
    }
};

export const useEventConfig = () => {
    // We can also allow local overrides or hydration if needed
    const [config, setConfig] = useState<EventConfig>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                // 1. Initialize DB Store (Async)
                await initWhiteLabeling(API_URL);

                // 2. Load Domain Specific Configs (Sync / Cached)
                const baseConfig = loadConfigs();
                const assets = loadAssets();
                const themeVars = loadTheme(true); // Load and apply

                // 3. Compose final configuration object for the App
                const fullConfig: EventConfig = {
                    ...baseConfig,
                    theme: {
                        assets,
                        variables: themeVars
                    }
                };

                // 4. Update State & UI
                setConfig(fullConfig);

            } catch (error) {
                console.error('Failed to load event config:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContext();
    }, []);

    return { config, isLoading };
}
