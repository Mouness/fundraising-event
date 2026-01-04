import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhiteLabelStore, initWhiteLabeling, getGlobalConfig, getEventConfig } from '../store';

// Mock global fetch
global.fetch = vi.fn();

describe('WhiteLabelStore', () => {
    beforeEach(() => {
        // Reset Singleton State
        WhiteLabelStore.reset();
    });

    it('should be a singleton', () => {
        const instance1 = WhiteLabelStore.getInstance();
        const instance2 = WhiteLabelStore.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should store and retrieve configuration', () => {
        const store = WhiteLabelStore.getInstance();
        const mockConfig = { id: '1', content: { title: 'Test', totalLabel: 'Total', goalAmount: 100 } } as any;

        store.setGlobalConfig(mockConfig);
        expect(store.getGlobalConfig()).toEqual(mockConfig);
        expect(getGlobalConfig()).toEqual(mockConfig);

        store.setEventConfig(mockConfig);
        expect(store.getEventConfig()).toEqual(mockConfig);
        expect(getEventConfig()).toEqual(mockConfig);
    });
});

describe('initWhiteLabeling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        WhiteLabelStore.reset();
    });

    it('should fetch configuration from API and update store', async () => {
        const mockGlobal = { id: 'global', content: { title: 'Global' } };
        const mockEvent = { id: 'event-1', content: { title: 'Event' } };

        (global.fetch as any)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockGlobal,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockEvent,
            });

        await initWhiteLabeling('http://api.test', 'event-slug');

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/settings/global', expect.objectContaining({
            headers: { 'Accept': 'application/json' }
        }));

        expect(global.fetch).toHaveBeenCalledWith('http://api.test/events/event-slug/settings', expect.objectContaining({
            headers: { 'Accept': 'application/json' }
        }));

        expect(getGlobalConfig()).toEqual(mockGlobal);
        expect(getEventConfig()).toEqual(mockEvent);
    });

    it('should handle fetch errors gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        await initWhiteLabeling('http://api.test');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
