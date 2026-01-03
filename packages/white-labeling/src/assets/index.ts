import logo from './images/logo.svg';
import { getGlobalConfig, getEventConfig } from '../store';
import { deepMerge } from '../utils/merge';

const defaultAssets = {
    logo: logo,
    favicon: '',
    backgroundDonor: '',
    backgroundLive: '',
    backgroundLanding: '',
};

export type AssetRegistry = typeof defaultAssets;

/**
 * Loads the final assets map by merging defaults with database overrides.
 */
export function loadAssets(): AssetRegistry {
    const globalAssets = getGlobalConfig()?.theme?.assets || {};
    const eventAssets = getEventConfig()?.theme?.assets || {};

    // Filter out empty strings/nulls to avoid overriding defaults with empty values
    const cleanAssets = (assets: Partial<AssetRegistry>) => {
        const cleaned = { ...assets };
        (Object.keys(cleaned) as Array<keyof AssetRegistry>).forEach((key) => {
            if (!cleaned[key]) {
                delete cleaned[key];
            }
        });
        return cleaned;
    };

    // Merge: Default < Global < Event
    return deepMerge(defaultAssets, cleanAssets(globalAssets), cleanAssets(eventAssets)) as AssetRegistry;
}
