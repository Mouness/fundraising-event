import logo from './images/logo.svg';
import { getDbConfig } from '../store';
import { deepMerge } from '../utils/merge';

const defaultAssets = {
    logo
};

/**
 * Loads the final assets map by merging defaults with database overrides.
 */
export function loadAssets(): Record<string, string> {
    const dbAssets = getDbConfig()?.themeConfig?.assets || {};
    return deepMerge(defaultAssets, dbAssets);
}
