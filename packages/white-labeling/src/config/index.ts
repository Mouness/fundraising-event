import eventConfigDefault from './event-config.default.json';
import { getGlobalConfig, getEventConfig } from '../store';
import { deepMerge } from '../utils/merge';
import type { DeepPartial, EventConfig } from '../types';

/**
 * Loads the structural and content configuration.
 * Merges defaults with database overrides (if any).
 */
export function loadConfigs(): EventConfig {
    const globalConfig = getGlobalConfig();
    const eventConfig = getEventConfig();
    const baseConfig = eventConfigDefault as EventConfig;

    // 1. Defaults
    let result = baseConfig;

    // 2. Global Overrides
    if (globalConfig) {
        result = deepMerge(result, globalConfig as DeepPartial<EventConfig>);
    }

    // 3. Event Overrides
    if (eventConfig) {
        result = deepMerge(result, eventConfig as DeepPartial<EventConfig>);
    }

    return result;
}

export { eventConfigDefault as defaultConfig };