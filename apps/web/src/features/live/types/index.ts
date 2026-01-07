import type { Donation } from '@features/live/components/DonationFeed';
import type { EventConfig } from '@fundraising/white-labeling';

export interface LiveThemeProps {
    config: EventConfig;
    donations: Donation[];
    totalRaisedCents: number;
    prevTotal: number;
    activeSlug: string;
}

export interface GaugeProps {
    totalRaisedCents: number;
    prevTotal: number;
    goalAmount: number;
    totalLabel?: string;
}
