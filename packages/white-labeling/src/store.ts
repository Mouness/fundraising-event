import axios from 'axios';
import type { EventConfig } from './types';

export class WhiteLabelStore {
    private static instance: WhiteLabelStore | null = null;
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
        // Resetting singleton for testing
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
 * Fetches global configuration and updates the store.
 */
export const fetchGlobalConfig = async (apiUrl: string): Promise<EventConfig | null> => {
    try {
        const store = WhiteLabelStore.getInstance();
        const { data } = await axios.get(`${apiUrl}/settings/global`, {
            headers: { 'Accept': 'application/json' }
        });
        store.setGlobalConfig(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch global config:', error);
    }
    return null;
}

/**
 * Fetches event configuration and updates the store.
 */
export const fetchEventConfig = async (apiUrl: string, slug: string): Promise<EventConfig | null> => {
    try {
        const store = WhiteLabelStore.getInstance();
        const { data } = await axios.get(`${apiUrl}/events/${slug}/settings`, {
            headers: { 'Accept': 'application/json' }
        });
        store.setEventConfig(data);
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.warn(`Event config for "${slug}" not found.`);
            WhiteLabelStore.getInstance().setEventConfig(null);
        } else {
            console.error('Failed to fetch event config:', error);
        }
    }
    return null;
}

/**
 * Initializes the white-labeling library by fetching configuration from the backend.
 * This function now expects specific endpoints for global and event settings.
 */
export const initWhiteLabeling = async (apiUrl: string, slug?: string): Promise<void> => {
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
