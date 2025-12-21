import { describe, it, expect } from 'vitest';
import { loadConfig, defaultConfig } from './index';

describe('loadConfig', () => {
    it('should return default config if no custom config provided', () => {
        const result = loadConfig();
        expect(result).toEqual(defaultConfig);
    });

    it('should merge custom config overrides', () => {
        const custom = {
            content: {
                title: "Custom Event"
            }
        };
        const result = loadConfig(custom);
        expect(result.content.title).toBe("Custom Event");
        expect(result.theme.primaryColor).toBe(defaultConfig.theme.primaryColor);
    });

    it('should replace arrays in config (e.g. sharing networks)', () => {
        const custom = {
            donation: {
                sharing: {
                    networks: ['twitter']
                }
            }
        };
        // @ts-expect-error - Testing invalid implementation handling
        const result = loadConfig(custom);
        expect(result.donation.sharing.networks).toEqual(['twitter']);
        expect(result.donation.sharing.networks).toHaveLength(1);
    });
});
