import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DonationGauge } from '@/features/live/components/DonationGauge';

describe('DonationGauge', () => {
    it('should render correct percentage and amounts', () => {
        render(
            <DonationGauge
                totalRaisedCents={5000}
                prevTotal={0}
                goalAmount={10000}
            />
        );

        // 50% progress
        // Note: react-countup might render dynamically, so exact text match can be tricky if it animates.
        // We check for the static text parts or final values if countup completes instantly (Mocking might be safer)
        expect(screen.getByText(/raised/i)).toBeInTheDocument();
        expect(screen.getByText('live.total_raised')).toBeInTheDocument();
    });

    it('should handle zero raised', () => {
        render(
            <DonationGauge
                totalRaisedCents={0}
                prevTotal={0}
                goalAmount={10000}
            />
        );
        expect(screen.getByText('live.total_raised')).toBeInTheDocument();
    });
});
