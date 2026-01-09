import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhiteLabelStore, initWhiteLabeling, getGlobalConfig, getEventConfig } from '../store';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('WhiteLabelStore', () => {
    beforeEach(() => {
        // Reset Singleton State
        WhiteLabelStore.reset();
        vi.clearAllMocks();
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

        (axios.get as any)
            .mockResolvedValueOnce({
                data: mockGlobal,
            })
            .mockResolvedValueOnce({
                data: mockEvent,
            });

        await initWhiteLabeling('http://api.test', 'event-slug');

        expect(axios.get).toHaveBeenCalledWith('http://api.test/settings/global', expect.objectContaining({
            headers: { 'Accept': 'application/json' }
        }));

        expect(axios.get).toHaveBeenCalledWith('http://api.test/events/event-slug/settings', expect.objectContaining({
            headers: { 'Accept': 'application/json' }
        }));

        expect(getGlobalConfig()).toEqual(mockGlobal);
        expect(getEventConfig()).toEqual(mockEvent);
    });

    it('should handle fetch errors gracefully', async () => {
        (axios.get as any).mockRejectedValue(new Error('Network Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        await initWhiteLabeling('http://api.test');

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
