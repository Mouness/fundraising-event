import { describe, it, expect, vi } from 'vitest';
import { rtlRender as render, screen } from '../../../../utils';
import { GaugeModern } from '../../../../../features/live/components/gauges/GaugeModern';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal: string) => defaultVal || key,
    }),
    initReactI18next: {
        type: '3rdParty',
        init: () => { },
    },
}));

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (val: number) => `$${val.toFixed(2)}`,
    }),
}));

// Mock react-countup since it uses requestAnimationFrame
vi.mock('react-countup', () => ({
    default: ({ end, formattingFn }: { end: number, formattingFn: (n: number) => string }) => (
        <span>{formattingFn ? formattingFn(end) : end}</span>
    ),
}));

describe('GaugeModern', () => {
    const defaultProps = {
        totalRaisedCents: 500000, // $5,000
        prevTotal: 0,
        goalAmount: 10000, // $10,000
        totalLabel: 'Total Raised',
        currency: 'USD',
    };

    it('renders correctly with given props', () => {
        render(<GaugeModern {...defaultProps} />);

        expect(screen.getByText('Total Raised')).toBeInTheDocument();
        expect(screen.getByText('$5000.00')).toBeInTheDocument(); // 500000 cents / 100
        expect(screen.getByText('GOAL: $10000.00')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('handles zero goal amount gracefully (prevents NaN)', () => {
        render(<GaugeModern {...defaultProps} goalAmount={0} />);

        // Should default to 100% when goal is 0
        expect(screen.getByText('100%')).toBeInTheDocument();
        expect(screen.getByText('GOAL: $0.00')).toBeInTheDocument();
    });

    it('caps percentage at 100%', () => {
        render(<GaugeModern {...defaultProps} totalRaisedCents={2000000} />); // $20,000 raised, Goal $10,000

        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('uses custom total label', () => {
        render(<GaugeModern {...defaultProps} totalLabel="Notre Objectif" />);

        expect(screen.getByText('Notre Objectif')).toBeInTheDocument();
    });
});
