import eventConfigDefault from './event-config.default.json';
import { deepMerge } from '../utils/merge';
import { DeepPartial, EventConfig } from '../types';
import { assets } from '../assets';

// Override static paths with imported assets (for bundler hashing)
// We cast to any to bypass strict DeepPartial checks on the merge source for now
export const defaultConfig = deepMerge(eventConfigDefault as EventConfig, {
    theme: {
        logoUrl: assets.logo
    }
} as any);


/**
 * Loads the final configuration by merging the default config with a provided custom config.
 * @param customConfig Optional custom configuration to override defaults
 * @returns Merged EventConfig
 */
export function loadConfig(customConfig?: DeepPartial<EventConfig>): EventConfig {
    if (!customConfig) return defaultConfig;
    return deepMerge(defaultConfig, customConfig);
}

