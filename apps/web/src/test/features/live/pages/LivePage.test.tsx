import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render as rtlRender, screen } from '@testing-library/react'
import { LivePage } from '../../../../features/live/pages/LivePage'
import { useLiveSocket } from '../../../../features/live/hooks/useLiveSocket'
import * as confetti from '@core/lib/confetti'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

const render = (ui: React.ReactElement) => {
    const testQueryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={testQueryClient}>
            <MemoryRouter initialEntries={['/test-event']}>{children}</MemoryRouter>
        </QueryClientProvider>
    )

    return rtlRender(ui, { wrapper: Wrapper })
}

// Mock Dependencies
vi.mock('@core/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}))
import { api } from '@core/lib/api'

vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: vi.fn(),
    AppConfigProvider: ({ children }: any) => <>{children}</>,
}))

vi.mock('../../../../features/live/hooks/useLiveSocket', () => ({
    useLiveSocket: vi.fn(),
}))

vi.mock('@core/lib/confetti', () => ({
    fireConfetti: vi.fn(),
    fireGoalCelebration: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()
    return {
        ...actual,
        useParams: () => ({ slug: 'test-event' }),
    }
})

// Mock Themes to verify switching
vi.mock('../../../../features/live/components/themes/LiveClassic', () => ({
    LiveClassic: (props: any) => (
        <div data-testid="live-classic">Classic Theme: {props.totalRaisedCents}</div>
    ),
}))
vi.mock('../../../../features/live/components/themes/LiveModern', () => ({
    LiveModern: (props: any) => (
        <div data-testid="live-modern">Modern Theme: {props.totalRaisedCents}</div>
    ),
}))
vi.mock('../../../../features/live/components/themes/LiveElegant', () => ({
    LiveElegant: (props: any) => (
        <div data-testid="live-elegant">Elegant Theme: {props.totalRaisedCents}</div>
    ),
}))

import { useAppConfig } from '@core/providers/AppConfigProvider'

describe('LivePage', () => {
    const mockConfig = {
        id: 'evt_1',
        slug: 'test-event',
        content: { goalAmount: 1000 },
        live: { theme: 'classic' },
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(api.get).mockReset() // Reset implementation
        ;(useAppConfig as any).mockReturnValue({ config: mockConfig })
        ;(useLiveSocket as any).mockReturnValue({ lastEvent: null })
    })

    it('renders the correct theme based on config', () => {
        // Classic (default)
        render(<LivePage />)
        expect(screen.getByTestId('live-classic')).toBeInTheDocument()

        // Modern
        ;(useAppConfig as any).mockReturnValue({
            config: { ...mockConfig, live: { theme: 'modern' } },
        })
        render(<LivePage />)
        expect(screen.getByTestId('live-modern')).toBeInTheDocument()

        // Elegant
        ;(useAppConfig as any).mockReturnValue({
            config: { ...mockConfig, live: { theme: 'elegant' } },
        })
        render(<LivePage />)
        expect(screen.getByTestId('live-elegant')).toBeInTheDocument()
    })

    it('initializes state from fetched event data', async () => {
        vi.mocked(api.get).mockResolvedValue({
            data: {
                id: 'evt_1',
                raised: 1500, // $1500 -> 150000 cents
                donations: [
                    {
                        id: 'd1',
                        amount: 5000,
                        donorName: 'Alice',
                        createdAt: new Date().toISOString(),
                    },
                ],
            },
        })

        render(<LivePage />)

        // Wait for query to resolve and update state
        await screen.findByText('Classic Theme: 150000')
    })

    it('updates total updates on socket event', async () => {
        const { rerender } = render(<LivePage />)

        // Default empty state
        expect(screen.getByText('Classic Theme: 0')).toBeInTheDocument()

        // Simulate socket event
        ;(useLiveSocket as any).mockReturnValue({
            lastEvent: {
                amount: 5000,
                donorName: 'John',
                isAnonymous: false,
                currency: 'USD',
            },
        })

        rerender(<LivePage />)

        await screen.findByText('Classic Theme: 5000')
    })

    it('fires confetti on large donation', () => {
        const { rerender } = render(<LivePage />)

        // Simulate large donation (>= 5000)
        ;(useLiveSocket as any).mockReturnValue({
            lastEvent: {
                amount: 5000,
                donorName: 'Big Spender',
                isAnonymous: false,
                currency: 'USD',
            },
        })

        rerender(<LivePage />)

        expect(confetti.fireConfetti).toHaveBeenCalled()
    })

    it('fires goal celebration when goal reached', async () => {
        ;(useAppConfig as any).mockReturnValue({
            config: { ...mockConfig, content: { goalAmount: 100 } },
        })

        const { rerender } = render(<LivePage />)

        // 1. Almost there
        ;(useLiveSocket as any).mockReturnValue({
            lastEvent: {
                amount: 9000,
                donorName: 'A',
                isAnonymous: false,
                currency: 'USD',
            },
        })
        rerender(<LivePage />)

        // 2. Cross the line
        ;(useLiveSocket as any).mockReturnValue({
            lastEvent: {
                amount: 2000,
                donorName: 'B',
                isAnonymous: false,
                currency: 'USD',
            },
        })
        rerender(<LivePage />)

        await vi.waitUntil(() => (confetti.fireGoalCelebration as any).mock.calls.length > 0)
        expect(confetti.fireGoalCelebration).toHaveBeenCalled()
    })
})
