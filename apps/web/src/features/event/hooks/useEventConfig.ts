import { useState, useEffect } from 'react';
import { loadConfig } from '@fundraising/white-labeling';
import type { EventConfig } from '@fundraising/white-labeling';

// Default fallback config
const INITIAL_STATE = loadConfig();

export const useEventConfig = () => {
    const [config, setConfig] = useState<EventConfig>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContext = async () => {
            const timestamp = Date.now();

            // 1. Fetch Config Strategy (Deep Merge)
            try {
                const res = await fetch(`/config/event-config.json?v=${timestamp}`);
                if (res.ok) {
                    const customConfig = await res.json();
                    setConfig(loadConfig(customConfig));
                }
            } catch (error) {
                // Ignore, keep default
            }

            // 2. Fetch Theme CSS Strategy (Cascade Override)
            // We check if a custom theme file exists and inject it to override the default bundle.
            try {
                const themeRes = await fetch(`/config/theme.css?v=${timestamp}`);
                if (themeRes.ok) {
                    const css = await themeRes.text();
                    injectThemeStyle(css);
                }
            } catch {
                // Ignore, keep default bundle
            }

            setIsLoading(false);
        };

        fetchContext();
    }, []);

    return { config, isLoading };
}

// Helper to inject CSS into the document head
function injectThemeStyle(css: string) {
    const styleId = 'custom-event-theme';
    let style = document.getElementById(styleId) as HTMLStyleElement;

    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }

    style.textContent = css;
}
