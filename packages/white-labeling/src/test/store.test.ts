import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhiteLabelStore, initWhiteLabeling, getDbConfig } from '../store';

// Mock global fetch
global.fetch = vi.fn();

describe('WhiteLabelStore', () => {
    beforeEach(() => {
        // Reset Singleton State (Hack: accessing private instance if possible, or just re-setting via public method if we had clear)
        // Since we can't easily reset a Singleton module-level instance without exposing a method, we might just assume sequential runs or add a reset method.
        // For now, allow side-effects or add a method 'reset' for testing.
        // Actually, we can just use the public API.
        WhiteLabelStore.getInstance().setDbConfig({ name: 'Reset', goalAmount: 0, themeConfig: {} });
    });

    it('should be a singleton', () => {
        const instance1 = WhiteLabelStore.getInstance();
        const instance2 = WhiteLabelStore.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should store and retrieve configuration', () => {
        const store = WhiteLabelStore.getInstance();
        const mockConfig = { name: 'Event A', goalAmount: 100, themeConfig: { primary: 'red' } };
        store.setDbConfig(mockConfig);
        expect(store.getDbConfig()).toEqual(mockConfig);
        expect(getDbConfig()).toEqual(mockConfig);
    });
});

describe('initWhiteLabeling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch configuration from API and update store', async () => {
        const mockData = [{ name: 'API Event', goalAmount: 500, themeConfig: {} }];
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockData,
        });

        await initWhiteLabeling('http://api.test');

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/events', expect.objectContaining({
            headers: { 'Accept': 'application/json' }
        }));

        expect(getDbConfig()).toEqual(mockData[0]);
    });

    it('should handle fetch errors gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        await initWhiteLabeling('http://api.test');

        expect(consoleSpy).toHaveBeenCalled();
    });
});
