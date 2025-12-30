import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventConfig } from '@/features/event/hooks/useEventConfig';

// Mock fetch
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Mock white-labeling package
// Mock white-labeling package
// Mock white-labeling package
vi.mock('@fundraising/white-labeling', async () => {
    return {
        initWhiteLabeling: vi.fn(),
        loadConfigs: vi.fn(() => ({ content: { title: 'Default Title' } })),
        loadAssets: vi.fn(() => ({ logo: 'default-logo.svg' })),
        loadTheme: vi.fn(() => ({}))
    }
});

import { initWhiteLabeling, loadConfigs, loadAssets } from '@fundraising/white-labeling';

describe('useEventConfig', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Default mocks
        (loadConfigs as Function as any).mockReturnValue({ content: { title: 'Default Title' } });
        (loadAssets as Function as any).mockReturnValue({ logo: 'default-logo.svg' });
    });

    it('should return initial loading state', () => {
        (initWhiteLabeling as Function as any).mockImplementation(() => new Promise(() => { })); // Hang
        const { result } = renderHook(() => useEventConfig());
        expect(result.current.isLoading).toBe(true);
    });

    it('should load and merge configs from loaders', async () => {
        (loadConfigs as Function as any).mockReturnValue({ content: { title: 'Modular Title' }, theme: { assets: {}, variables: {} } });
        (loadAssets as Function as any).mockReturnValue({ logo: 'modular-logo.png' });

        const { result } = renderHook(() => useEventConfig());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(initWhiteLabeling).toHaveBeenCalled();
        expect(result.current.config.content?.title).toBe('Modular Title');
        expect(result.current.config.theme?.assets?.logo).toBe('modular-logo.png');
    });

    it('should handle init failure silently and load defaults', async () => {
        (initWhiteLabeling as Function as any).mockRejectedValue(new Error('Init failed'));

        const { result } = renderHook(() => useEventConfig());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Should still rely on loaders (which return defaults mocked above)
        expect(result.current.config.content.title).toBe('Default Title');
    });
});

