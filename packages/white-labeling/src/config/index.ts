import eventConfigDefault from './event-config.default.json';
import { getDbConfig } from '../store';
import { deepMerge } from '../utils/merge';
import type { DeepPartial, EventConfig } from '../types';

/**
 * Loads the structural and content configuration.
 * Merges defaults with database overrides (if any).
 */
export function loadConfigs(): EventConfig {
    const dbConfig = getDbConfig();
    const baseConfig = eventConfigDefault as EventConfig;

    if (!dbConfig) {
        return baseConfig;
    }

    const remoteConfig: DeepPartial<EventConfig> = {
        content: {
            title: dbConfig.name,
            goalAmount: Number(dbConfig.goalAmount),
        },
        theme: dbConfig.themeConfig as DeepPartial<EventConfig['theme']>,
    };

    return deepMerge(baseConfig, remoteConfig);
}
