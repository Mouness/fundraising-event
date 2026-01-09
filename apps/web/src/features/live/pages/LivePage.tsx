import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@core/lib/api';
import { useParams } from 'react-router-dom';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { useLiveSocket } from '@features/live/hooks/useLiveSocket';
import { fireConfetti } from '@core/lib/confetti';
import { LiveClassic } from '../components/themes/LiveClassic';
import { LiveModern } from '../components/themes/LiveModern';
import { LiveElegant } from '../components/themes/LiveElegant';
import type { Donation } from '@features/live/components/DonationFeed';

export const LivePage = () => {
    const { config } = useAppConfig();
    const { slug } = useParams<{ slug: string }>();
    const activeSlug = slug || config.slug || 'default';

    // Fetch initial event state
    const { data: event } = useQuery({
        queryKey: ['live-event-stats', activeSlug],
        queryFn: async () => {
            const { data } = await api.get(`/events/${activeSlug}`);
            return data;
        },
        enabled: !!activeSlug && activeSlug !== 'default'
    });

    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalRaisedCents, setTotalRaisedCents] = useState(0);
    const [prevTotal, setPrevTotal] = useState(0);

    // Initialize state from fetched event
    useEffect(() => {
        if (event) {
            if (event.raised !== undefined) {
                const raisedCents = Math.round(Number(event.raised) * 100);
                setTotalRaisedCents(raisedCents);
                setPrevTotal(raisedCents);
            }
            if (event.donations && Array.isArray(event.donations)) {
                // Map API donations to local Donation type
                const mappedDonations: Donation[] = event.donations.map((d: any) => ({
                    ...d,
                    timestamp: d.createdAt ? new Date(d.createdAt).getTime() : Date.now(),
                }));
                setDonations(mappedDonations.slice(0, 8));
            }
        }
    }, [event]);

    const { lastEvent } = useLiveSocket(event?.id || config.id || 'default');

    useEffect(() => {
        if (lastEvent) {
            const newDonation: Donation = {
                ...lastEvent,
                timestamp: Date.now(),
            };

            setPrevTotal((prev) => prev);
            setTotalRaisedCents((prev) => {
                const newTotal = prev + lastEvent.amount;
                if (lastEvent.amount >= 5000) {
                    fireConfetti();
                }
                // Trigger Goal Celebration
                if (prev < (config.content.goalAmount * 100) && newTotal >= (config.content.goalAmount * 100)) {
                    import('@core/lib/confetti').then(mod => mod.fireGoalCelebration());
                }
                return newTotal;
            });

            setDonations((prev) => [newDonation, ...prev].slice(0, 8));
        }
    }, [lastEvent, config.content.goalAmount]);

    const theme = config.live?.theme || 'classic';

    // Merge real event data into config to ensure goal/title/etc are up to date
    const effectiveConfig = event ? {
        ...config,
        content: {
            ...config.content,
            goalAmount: Number(event.goalAmount) || config.content.goalAmount,
            title: event.name || config.content.title
        }
    } : config;

    const props = {
        config: effectiveConfig,
        donations,
        totalRaisedCents,
        prevTotal,
        activeSlug
    };

    switch (theme) {
        case 'modern':
            return <LiveModern {...props} />;
        case 'elegant':
            return <LiveElegant {...props} />;
        case 'classic':
        default:
            return <LiveClassic {...props} />;
    }
}
