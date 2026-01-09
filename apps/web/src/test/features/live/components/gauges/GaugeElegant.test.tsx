import { describe, it, expect, vi } from 'vitest';
import { rtlRender as render, screen } from '../../../../utils';
import { GaugeElegant } from '../../../../../features/live/components/gauges/GaugeElegant';

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

vi.mock('react-countup', () => ({
    default: ({ end, formattingFn }: { end: number, formattingFn: (n: number) => string }) => (
        <span>{formattingFn ? formattingFn(end) : end}</span>
    ),
}));

describe('GaugeElegant', () => {
    const defaultProps = {
        totalRaisedCents: 500000,
        prevTotal: 0,
        goalAmount: 10000,
        totalLabel: 'Total Raised',
        currency: 'USD',
    };

    it('renders correctly with given props', () => {
        render(<GaugeElegant {...defaultProps} />);

        expect(screen.getByText('Total Raised')).toBeInTheDocument();
        expect(screen.getByText('$5000.00')).toBeInTheDocument();
        expect(screen.getByText('Target: $10000.00')).toBeInTheDocument();
    });

    it('handles zero goal amount gracefully', () => {
        render(<GaugeElegant {...defaultProps} goalAmount={0} />);

        expect(screen.getByText('Target: $0.00')).toBeInTheDocument();
    });

    it('uses custom total label', () => {
        render(<GaugeElegant {...defaultProps} totalLabel="Notre Objectif" />);

        expect(screen.getByText('Notre Objectif')).toBeInTheDocument();
    });
});
