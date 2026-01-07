import { describe, it, expect, vi } from 'vitest';
import { rtlRender as render, screen } from '../../../../utils';
import { LiveClassic } from '../../../../../features/live/components/themes/LiveClassic';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal: string) => defaultVal || key,
    }),
    Trans: ({ values }: any) => <span>{values?.url || 'URL'}</span>,
    initReactI18next: { type: '3rdParty', init: () => { } }
}));

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (val: number) => `$${val}`,
    }),
}));

// Mock GaugeClassic and DonationFeed to avoid deep rendering complexity if needed,
// but real ones are fine if they don't cause issues.
// Let's mock them to focus on LiveClassic structure.
vi.mock('../../../../../features/live/components/gauges/GaugeClassic', () => ({
    GaugeClassic: ({ totalRaisedCents }: any) => <div data-testid="gauge">Gauge: {totalRaisedCents}</div>
}));
vi.mock('../../../../../features/live/components/DonationFeed', () => ({
    DonationFeed: ({ donations }: any) => <div data-testid="feed">Feed: {donations.length}</div>
}));

describe('LiveClassic Theme', () => {
    const mockConfig = {
        name: 'Event Name',
        content: { title: 'Custom Title', goalAmount: 1000 },
        theme: { assets: { logo: 'logo.png' } },
        description: 'Event Description'
    };
    const defaultProps = {
        config: mockConfig as any,
        donations: [{} as any],
        totalRaisedCents: 5000,
        prevTotal: 0,
        activeSlug: 'event-slug'
    };

    it('renders layout elements correctly', () => {
        render(<LiveClassic {...defaultProps} />);

        expect(screen.getByText('Custom Title')).toBeInTheDocument();
        expect(screen.getByText('Event Description')).toBeInTheDocument();
        expect(screen.getByAltText('Event Logo')).toBeInTheDocument();

        expect(screen.getByTestId('gauge')).toHaveTextContent('Gauge: 5000');
        expect(screen.getByTestId('feed')).toHaveTextContent('Feed: 1');
    });

    it('displays QR code section', () => {
        render(<LiveClassic {...defaultProps} />);
        // QR Code generates an SVG. We can check for the surrounding text.
        expect(screen.getByText('live.scan_to_donate')).toBeInTheDocument();
    });
});
