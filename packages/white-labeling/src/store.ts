import type { EventConfig } from './types';

export class WhiteLabelStore {
    private static instance: WhiteLabelStore;
    private globalConfig: EventConfig | null = null;
    private eventConfig: EventConfig | null = null;

    private constructor() { }

    public static getInstance(): WhiteLabelStore {
        if (!WhiteLabelStore.instance) {
            WhiteLabelStore.instance = new WhiteLabelStore();
        }
        return WhiteLabelStore.instance;
    }

    public static reset(): void {
        // @ts-ignore
        WhiteLabelStore.instance = null;
    }

    public setGlobalConfig(config: EventConfig | null): void {
        this.globalConfig = config;
    }

    public setEventConfig(config: EventConfig | null): void {
        this.eventConfig = config;
    }

    public getGlobalConfig(): EventConfig | null {
        return this.globalConfig;
    }

    public getEventConfig(): EventConfig | null {
        return this.eventConfig;
    }
}

/**
 * Helper accessors
 */
export const getGlobalConfig = () => WhiteLabelStore.getInstance().getGlobalConfig();
export const getEventConfig = () => WhiteLabelStore.getInstance().getEventConfig();

/**
 * Initializes the white-labeling library by fetching configuration from the backend.
 * This function now expects specific endpoints for global and event settings.
 */
/**
 * Fetches global configuration and updates the store.
 */
export async function fetchGlobalConfig(apiUrl: string): Promise<EventConfig | null> {
    try {
        const store = WhiteLabelStore.getInstance();
        const res = await fetch(`${apiUrl}/settings/global`, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
            const data = await res.json();
            store.setGlobalConfig(data);
            return data;
        }
    } catch (error) {
        console.error('Failed to fetch global config:', error);
    }
    return null;
}

/**
 * Fetches event configuration and updates the store.
 */
export async function fetchEventConfig(apiUrl: string, slug: string): Promise<EventConfig | null> {
    try {
        const store = WhiteLabelStore.getInstance();
        const res = await fetch(`${apiUrl}/events/${slug}/settings`, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
            const data = await res.json();
            store.setEventConfig(data);
            return data;
        } else {
            console.warn(`Event config for "${slug}" not found.`);
            store.setEventConfig(null);
        }
    } catch (error) {
        console.error('Failed to fetch event config:', error);
    }
    return null;
}

/**
 * Initializes the white-labeling library by fetching configuration from the backend.
 * This function now expects specific endpoints for global and event settings.
 */
export async function initWhiteLabeling(apiUrl: string, slug?: string): Promise<void> {
    await fetchGlobalConfig(apiUrl);

    if (slug) {
        await fetchEventConfig(apiUrl, slug);
    } else {
        WhiteLabelStore.getInstance().setEventConfig(null);
    }
}

/**
 * Resets the white-labeling store for testing purposes.
 */
export const resetWhiteLabelStore = () => WhiteLabelStore.reset();
