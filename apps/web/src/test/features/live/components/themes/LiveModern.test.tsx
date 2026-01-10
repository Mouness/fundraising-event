import { describe, it, expect, vi } from 'vitest'
import { rtlRender as render, screen } from '../../../../utils'
import { LiveModern } from '../../../../../features/live/components/themes/LiveModern'

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal: string) => defaultVal || key,
    }),
    Trans: ({ values }: any) => <span>{values?.url || 'URL'}</span>,
    initReactI18next: { type: '3rdParty', init: () => {} },
}))

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (val: number) => `$${val}`,
    }),
}))

vi.mock('../../../../../features/live/components/gauges/GaugeModern', () => ({
    GaugeModern: ({ totalRaisedCents }: any) => (
        <div data-testid="gauge">Gauge: {totalRaisedCents}</div>
    ),
}))
vi.mock('../../../../../features/live/components/DonationFeed', () => ({
    DonationFeed: ({ donations }: any) => <div data-testid="feed">Feed: {donations.length}</div>,
}))

describe('LiveModern Theme', () => {
    const mockConfig = {
        name: 'Event Name',
        content: { title: 'Modern Title', goalAmount: 1000 },
        theme: { assets: { logo: 'logo.png' } },
        description: 'Description',
    }
    const defaultProps = {
        config: mockConfig as any,
        donations: [{} as any, {} as any],
        totalRaisedCents: 8000,
        prevTotal: 7000,
        activeSlug: 'modern-slug',
    }

    it('renders layout elements correctly', () => {
        render(<LiveModern {...defaultProps} />)

        expect(screen.getByText('Modern Title')).toBeInTheDocument()
        expect(screen.getByAltText('Logo')).toBeInTheDocument()

        expect(screen.getByTestId('gauge')).toHaveTextContent('Gauge: 8000')
        expect(screen.getByTestId('feed')).toHaveTextContent('Feed: 2')
    })
})
