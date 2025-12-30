interface RawDbEvent {
    name: string;
    goalAmount: number | string;
    themeConfig: Record<string, any>;
    [key: string]: any;
}

export class WhiteLabelStore {
    private static instance: WhiteLabelStore;
    private dbConfig: RawDbEvent | null = null;

    private constructor() { }


    public static getInstance(): WhiteLabelStore {
        if (!WhiteLabelStore.instance) {
            WhiteLabelStore.instance = new WhiteLabelStore();
        }
        return WhiteLabelStore.instance;
    }

    public setDbConfig(config: RawDbEvent): void {
        this.dbConfig = config;
    }

    public getDbConfig(): RawDbEvent | null {
        return this.dbConfig;
    }
}

/**
 * Helper accessor to get the current DB config.
 */
export const getDbConfig = () => WhiteLabelStore.getInstance().getDbConfig();

/**
 * Initializes the white-labeling library by fetching configuration from the backend.
 * This should be called once at application startup.
 * @param apiUrl Base URL for the API
 */
export async function initWhiteLabeling(apiUrl: string): Promise<void> {
    try {
        const response = await fetch(`${apiUrl}/events`, {
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                // Map the raw response to our config requirement if needed, 
                // but for now assuming the DB returns a structure we can use or mapping happens in loadConfigs.
                // Actually, store holds the RAW db object usually, but let's try to be cleaner.
                // The previous code stored "data[0]" which has "themeConfig".
                WhiteLabelStore.getInstance().setDbConfig(data[0]);
            }
        }
    } catch (error) {
        console.error('Failed to initialize white-labeling:', error);
        // State remains null, loaders will fallback to defaults
    }
}
