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

    public static reset(): void {
        // @ts-ignore
        WhiteLabelStore.instance = null;
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
export async function initWhiteLabeling(apiUrl: string, slug?: string): Promise<void> {
    try {
        const response = await fetch(`${apiUrl}/events`, {
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                let event;

                if (slug) {
                    const found = data.find((e: any) => e.slug === slug || e.id === slug);
                    if (found) {
                        event = found;
                    } else {
                        console.warn(`Event with slug "${slug}" not found, falling back to default.`);
                        event = data[0];
                    }
                } else {
                    // Portal mode: Try to find a 'portal' event, otherwise use generic platform config
                    const found = data.find((e: any) => e.slug === 'portal' || e.id === 'portal');
                    if (found) {
                        event = found;
                    } else {
                        event = {
                            id: 'platform',
                            name: 'Fundraising Platform',
                            slug: 'portal',
                            goalAmount: 0,
                            themeConfig: { variables: {} }
                        };
                    }
                }

                WhiteLabelStore.getInstance().setDbConfig(event);
            }
        }
    } catch (error) {
        console.error('Failed to initialize white-labeling:', error);
        // State remains null, loaders will fallback to defaults
    }
}
