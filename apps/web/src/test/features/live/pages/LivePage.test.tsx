import { render, screen, waitFor } from '@testing-library/react';
import { LivePage } from '@features/live/pages/LivePage';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'live.give_at') return 'Give at <1>{{url}}</1>';
            if (key === 'live.title') return 'Test event';
            return key;
        },
        i18n: {
            changeLanguage: () => new Promise(() => { }),
        },
    }),
    Trans: ({ i18nKey, values, components }: any) => {
        if (i18nKey === 'live.give_at') {
            return (
                <>
                    Give at {components[1]}
                    {values.url}
                </>
            );
        }
        return null;
    },
}));
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        config: {
            id: 'evt_123',
            content: { title: 'Test event', goalAmount: 5000 },
            donation: {
                sharing: { enabled: true, networks: ['twitter'] },
                payment: { provider: 'stripe', config: {} }
            },
            theme: { assets: { logo: 'logo.png' } },
        },
    }),
}));

vi.mock('@features/live/components/DonationFeed', () => ({
    DonationFeed: () => <div data-testid="feed">Feed</div>,
}));

vi.mock('@features/live/components/DonationGauge', () => ({
    DonationGauge: () => <div data-testid="gauge">Gauge</div>,
}));

vi.mock('@features/live/hooks/useLiveSocket', () => ({
    useLiveSocket: () => ({ lastEvent: null }),
}));

vi.mock('react-qr-code', () => ({
    default: () => <div data-testid="qr">QR</div>,
}));

describe('LivePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render correctly', async () => {
        render(<LivePage />);
        expect(screen.getByText('Test event')).toBeDefined();
        expect(screen.getByTestId('gauge')).toBeDefined();
        expect(screen.getByTestId('feed')).toBeDefined();
    });

    it('should show donor link correctly', async () => {
        render(<LivePage />);
        await waitFor(() => {
            expect(screen.getByText(/localhost:3000\/default\/donate/i)).toBeDefined();
        });
    });
});
