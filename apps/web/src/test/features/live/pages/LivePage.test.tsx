import { render, screen, act, waitFor } from '@testing-library/react';
import { LivePage } from '@/features/live/pages/LivePage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as liveHook from '@/features/live/hooks/useLiveSocket';

// Mocks
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/features/event/hooks/useEventConfig', () => ({
    useEventConfig: () => ({
        config: {
            id: 'evt_1',
            content: { title: 'Live Event', goalAmount: 1000, totalLabel: 'Raised' },
            theme: { assets: { logo: 'logo.png' } }
        }
    }),
}));
vi.mock('@/features/live/components/DonationFeed', () => ({
    DonationFeed: ({ donations }: any) => <div data-testid="feed">{donations.length} donations</div>,
}));
vi.mock('@/features/live/components/DonationGauge', () => ({
    DonationGauge: ({ totalRaisedCents }: any) => <div data-testid="gauge">Total: {totalRaisedCents}</div>,
}));
vi.mock('react-qr-code', () => ({
    default: () => <div>QRCode</div>,
}));
vi.mock('@/lib/confetti', () => ({
    fireConfetti: vi.fn(),
}));

// Mock hook
const useLiveSocketMock = vi.fn();
vi.mock('@/features/live/hooks/useLiveSocket', () => ({
    useLiveSocket: (slug: string) => useLiveSocketMock(slug),
}));

describe('LivePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useLiveSocketMock.mockReturnValue({ lastEvent: null });
    });

    it('should render initial state', () => {
        render(<LivePage />);
        expect(screen.getByText('Live Event')).toBeDefined();
        expect(screen.getByTestId('gauge')).toBeDefined();
        expect(screen.getByTestId('feed')).toBeDefined();
    });

    it('should update state on new donation event', async () => {
        const { rerender } = render(<LivePage />);

        // Simulate event
        act(() => {
            useLiveSocketMock.mockReturnValue({
                lastEvent: { amount: 1000, donorName: 'John', currency: 'usd', isAnonymous: false }
            });
        });
        rerender(<LivePage />);

        await waitFor(() => {
            expect(screen.getByText('Total: 1000')).toBeDefined();
            expect(screen.getByText('1 donations')).toBeDefined();
        });
    });
});
