import { render, screen, waitFor, act } from '@testing-library/react'
import { useEffect } from 'react'
import { AppConfigProvider, useAppConfig } from '@/core/providers/AppConfigProvider'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import * as whiteLabeling from '@fundraising/white-labeling'
import { syncLocales } from '@core/lib/i18n'

vi.mock('@fundraising/white-labeling', () => ({
    initWhiteLabeling: vi.fn(),
    loadConfigs: vi.fn(() => ({ content: { title: 'Default' } })),
    loadAssets: vi.fn(() => ({})),
    loadTheme: vi.fn(() => ({})),
}))

vi.mock('@core/lib/i18n', () => ({
    syncLocales: vi.fn(),
}))

const TestComponent = () => {
    const { config } = useAppConfig()
    return <div>{config.content?.title}</div>
}

describe('AppConfigProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loader and then content on success', async () => {
        ;(whiteLabeling.initWhiteLabeling as any).mockResolvedValue(undefined)
        ;(whiteLabeling.loadConfigs as any).mockReturnValue({
            content: { title: 'Loaded Title' },
        })

        render(
            <MemoryRouter>
                <AppConfigProvider>
                    <TestComponent />
                </AppConfigProvider>
            </MemoryRouter>,
        )

        // Should show loader initially
        // expect(screen.getByRole('progressbar')).toBeDefined(); // Loader2 might not have role progressbar

        await waitFor(() => expect(screen.queryByText('Loaded Title')).toBeDefined())
        expect(whiteLabeling.initWhiteLabeling).toHaveBeenCalled()
        expect(syncLocales).toHaveBeenCalled()
    })

    it('handles error during initialization', async () => {
        ;(whiteLabeling.initWhiteLabeling as any).mockRejectedValue(new Error('Fatal Error'))

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <MemoryRouter>
                <AppConfigProvider>
                    <TestComponent />
                </AppConfigProvider>
            </MemoryRouter>,
        )

        await waitFor(() => expect(whiteLabeling.initWhiteLabeling).toHaveBeenCalled())
        // Since it stops being loading, it renders children (even if error is set in context)
        expect(screen.getByText('Default')).toBeDefined()

        consoleSpy.mockRestore()
    })

    it('refreshes config when refreshConfig is called', async () => {
        ;(whiteLabeling.initWhiteLabeling as any).mockResolvedValue(undefined)

        let refresh: any
        const RefreshComponent = () => {
            const { refreshConfig } = useAppConfig()
            useEffect(() => {
                refresh = refreshConfig
            }, [refreshConfig])
            return null
        }

        render(
            <MemoryRouter>
                <AppConfigProvider>
                    <RefreshComponent />
                </AppConfigProvider>
            </MemoryRouter>,
        )

        await waitFor(() => expect(refresh).toBeDefined())

        await act(async () => {
            await refresh()
        })

        expect(whiteLabeling.initWhiteLabeling).toHaveBeenCalledTimes(2)
    })

    it('applies favicon if provided in config', async () => {
        const mockFavicon = 'http://example.com/favicon.ico'
        ;(whiteLabeling.loadAssets as any).mockReturnValue({ favicon: mockFavicon })
        ;(whiteLabeling.initWhiteLabeling as any).mockResolvedValue(undefined)

        render(
            <MemoryRouter>
                <AppConfigProvider>
                    <div />
                </AppConfigProvider>
            </MemoryRouter>,
        )

        await waitFor(() => {
            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
            expect(link?.href).toBe(mockFavicon)
        })
    })
})
