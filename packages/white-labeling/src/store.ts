
// Singleton State
interface WhiteLabelState {
    dbConfig: any | null;
}

const state: WhiteLabelState = {
    dbConfig: null
};

// Accessor
export const getDbConfig = () => state.dbConfig;

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
                state.dbConfig = data[0]; // Cache the raw DB event object
            }
        }
    } catch (error) {
        console.error('Failed to initialize white-labeling:', error);
        // State remains null, loaders will fallback to defaults
    }
}
