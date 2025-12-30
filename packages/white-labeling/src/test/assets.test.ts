import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAssets } from '../assets';
import { WhiteLabelStore } from '../store';

describe('loadAssets', () => {
    beforeEach(() => {
        // Reset store
        WhiteLabelStore.getInstance().setDbConfig({} as any);
    });

    it('should return default assets if no db config', () => {
        const assets = loadAssets();
        expect(assets.logo).toBeDefined();
    });

    it('should merge db assets', () => {
        WhiteLabelStore.getInstance().setDbConfig({
            name: 'test',
            goalAmount: 100,
            themeConfig: {
                assets: {
                    logo: 'custom-logo.png'
                }
            }
        });

        const assets = loadAssets();
        expect(assets.logo).toBe('custom-logo.png');
    });
});
