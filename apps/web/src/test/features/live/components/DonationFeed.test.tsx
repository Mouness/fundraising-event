import { describe, it, expect, vi } from 'vitest';
import { rtlRender as render, screen } from '../../../utils';
import { DonationFeed, type Donation } from '../../../../features/live/components/DonationFeed';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal: string) => {
            if (key === 'live.anonymous') return 'Someone';
            if (key === 'live.waiting') return 'Waiting for donations...';
            return defaultVal || key;
        },
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    },
}));

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (val: number, opts: { currency: string }) => `${opts?.currency || 'USD'} ${val}`,
    }),
}));

describe('DonationFeed', () => {
    const mockDonations: Donation[] = [
        {
            amount: 5000,
            currency: 'USD',
            donorName: 'John Doe',
            message: 'Good luck!',
            isAnonymous: false,
            timestamp: 1234567890
        },
        {
            amount: 10000,
            currency: 'USD',
            donorName: 'Jane Smith',
            isAnonymous: true,
            timestamp: 1234567891
        }
    ];

    it('renders donations list correctly', () => {
        render(<DonationFeed donations={mockDonations} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('"Good luck!"')).toBeInTheDocument();
        expect(screen.getByText('+USD 50')).toBeInTheDocument();

        expect(screen.getByText('Someone')).toBeInTheDocument(); // Anonymous
        expect(screen.getByText('+USD 100')).toBeInTheDocument();
    });

    it('renders waiting state when no donations', () => {
        render(<DonationFeed donations={[]} />);

        expect(screen.getByText('Waiting for donations...')).toBeInTheDocument();
    });
});
