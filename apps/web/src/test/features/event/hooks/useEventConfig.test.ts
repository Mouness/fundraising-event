import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventConfig } from '@/features/event/hooks/useEventConfig';

// Mock fetch
// Mock fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('useEventConfig', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return initial state (or default) initially', async () => {
        // Mock fetch to return immediately or hang to test loading state
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'test-event',
                theme: { primaryColor: '#000', secondaryColor: '#fff' }
            })
        });

        const { result } = renderHook(() => useEventConfig());

        expect(result.current.isLoading).toBe(true);
    });

    it('should load default config if user config is missing', async () => {
        // First call fails (user config)
        fetchMock.mockResolvedValueOnce({
            ok: false
        });
        // Second call succeeds (default config)
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'default-config',
                theme: { primaryColor: 'red', secondaryColor: 'blue' }
            })
        });

        const { result } = renderHook(() => useEventConfig());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.config.id).toBe('default-config');
        expect(result.current.config.theme.primaryColor).toBe('red');
    });
});
