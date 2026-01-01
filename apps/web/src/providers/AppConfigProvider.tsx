import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import {
    initWhiteLabeling,
    loadConfigs,
    loadAssets,
    loadTheme,
    type EventConfig
} from '@fundraising/white-labeling';
import { API_URL } from '@/lib/api';
import { syncLocales } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

interface AppConfigContextType {
    config: EventConfig;
    isLoading: boolean;
    error: Error | null;
}

// Initial state as fallback (synchronous defaults)
const INITIAL_CONFIG: EventConfig = {
    ...loadConfigs(),
    theme: {
        assets: loadAssets(),
        variables: loadTheme() // loads default theme
    }
};

const AppConfigContext = createContext<AppConfigContextType>({
    config: INITIAL_CONFIG,
    isLoading: true,
    error: null
});

export const AppConfigProvider = ({ children, slug }: PropsWithChildren<{ slug?: string }>) => {
    const [config, setConfig] = useState<EventConfig>(INITIAL_CONFIG);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Initialize DB Store (Async fetch from API)
                await initWhiteLabeling(API_URL, slug);

                // 2. Load Domain Specific Configs (Sync read from store)
                const baseConfig = loadConfigs();
                const assets = loadAssets();
                const themeVars = loadTheme(true); // Load and Apply CSS variables to :root

                // 3. Compose final configuration object
                const fullConfig: EventConfig = {
                    ...baseConfig,
                    theme: {
                        assets,
                        variables: themeVars
                    }
                };

                // 4. Apply Dynamic Locales
                syncLocales();

                setConfig(fullConfig);
            } catch (err) {
                console.error("Failed to initialize app config:", err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-muted/20">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    return (
        <AppConfigContext.Provider value={{ config, isLoading, error }}>
            {children}
        </AppConfigContext.Provider>
    );
};

export const useAppConfig = () => {
    const context = useContext(AppConfigContext);
    if (context === undefined) {
        throw new Error('useAppConfig must be used within an AppConfigProvider');
    }
    return context;
};
