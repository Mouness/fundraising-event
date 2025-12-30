import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfigs } from '../config';
import { WhiteLabelStore } from '../store';

describe('loadConfigs', () => {
    beforeEach(() => {
        WhiteLabelStore.getInstance().setDbConfig(null as any);
    });

    it('should return default config if no db config', () => {
        const config = loadConfigs();
        expect(config.content).toBeDefined();
        // Assuming default has some title or generic structure
        expect(config.content.title).toBeDefined();
    });

    it('should merge db content into config', () => {
        WhiteLabelStore.getInstance().setDbConfig({
            name: 'Custom Event',
            goalAmount: 5000,
            themeConfig: {}
        });

        const config = loadConfigs();
        expect(config.content.title).toBe('Custom Event');
        expect(config.content.goalAmount).toBe(5000);
    });
});
