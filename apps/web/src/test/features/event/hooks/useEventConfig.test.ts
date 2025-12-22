import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventConfig } from '@/features/event/hooks/useEventConfig';

// Mock fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Mock white-labeling package
vi.mock('@fundraising/white-labeling', async () => {
    const actual = await vi.importActual('@fundraising/white-labeling');
    return {
        ...actual,
        loadConfig: vi.fn((custom) => ({
            id: custom?.id || 'default-id',
            content: {
                title: custom?.content?.title || 'Default Title',
                totalLabel: custom?.content?.totalLabel || 'Total',
                goalAmount: custom?.content?.goalAmount || 1000
            },
            theme: {
                logoUrl: custom?.theme?.logoUrl || 'default-logo.svg'
            }
        }))
    }
});

describe('useEventConfig', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return initial loading state', () => {
        fetchMock.mockImplementation(() => new Promise(() => { })); // Hang
        const { result } = renderHook(() => useEventConfig());
        expect(result.current.isLoading).toBe(true);
    });

    it('should merge user config when fetch succeeds', async () => {
        fetchMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: 'custom-event',
                content: { title: 'Custom Config Title' }
            })
        });

        const { result } = renderHook(() => useEventConfig());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.config.id).toBe('custom-event');
        expect(result.current.config.content.title).toBe('Custom Config Title');
    });

    it('should fallback to defaults when fetch fails', async () => {
        fetchMock.mockResolvedValueOnce({ ok: false });

        const { result } = renderHook(() => useEventConfig());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.config.id).toBe('default-id');
        expect(result.current.config.theme.logoUrl).toBe('default-logo.svg');
    });
});
