import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfigs } from '../config';
import { WhiteLabelStore } from '../store';

describe('loadConfigs', () => {
    beforeEach(() => {
        WhiteLabelStore.getInstance().setEventConfig(null as any);
    });

    it('should return default config if no db config', () => {
        const config = loadConfigs();
        expect(config.content).toBeDefined();
        // Assuming default has some title or generic structure
        expect(config.content.title).toBeDefined();
    });

    it('should merge db content into config', () => {
        WhiteLabelStore.getInstance().setEventConfig({
            id: '1',
            content: {
                title: 'Custom Event',
                goalAmount: 5000
            },
        } as any);

        const config = loadConfigs();
        expect(config.content.title).toBe('Custom Event');
        expect(config.content.goalAmount).toBe(5000);
    });
});
