import { describe, it, expect, beforeEach } from 'vitest';
import { loadAssets } from '../assets';
import { WhiteLabelStore } from '../store';

describe('loadAssets', () => {
    beforeEach(() => {
        // Reset store
        WhiteLabelStore.getInstance().setEventConfig({ theme: { assets: {} } } as any);
    });

    it('should return default assets if no db config', () => {
        const assets = loadAssets();
        expect(assets.logo).toBeDefined();
    });

    it('should merge db assets', () => {
        WhiteLabelStore.getInstance().setEventConfig({
            // partial mock
            name: 'test',
            goalAmount: 100,
            theme: {
                assets: {
                    logo: 'custom-logo.png'
                }
            }
        } as any);

        const assets = loadAssets();
        expect(assets.logo).toBe('custom-logo.png');
    });
});
