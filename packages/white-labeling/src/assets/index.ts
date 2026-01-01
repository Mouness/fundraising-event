import logo from './images/logo.svg';
import { getDbConfig } from '../store';
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
    const dbAssets = getDbConfig()?.themeConfig?.assets || {};
    return deepMerge(defaultAssets, dbAssets) as AssetRegistry;
}
