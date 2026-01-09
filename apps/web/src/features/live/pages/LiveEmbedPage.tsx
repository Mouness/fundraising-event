import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEvent } from '@features/events/context/EventContext'
import { useLiveSocket } from '@features/live/hooks/useLiveSocket'
import { GaugeClassic } from '../components/gauges/GaugeClassic'
import { DonationFeed, type Donation } from '../components/DonationFeed'

export const LiveEmbedPage = () => {
    const { t } = useTranslation('common')
    const { event, isLoading } = useEvent()

    // State mirroring LivePage logic
    const [donations, setDonations] = useState<Donation[]>([])
    const [totalRaisedCents, setTotalRaisedCents] = useState(0)
    const [prevTotal, setPrevTotal] = useState(0)

    const { lastEvent } = useLiveSocket(event?.id || 'default')

    // Handle incoming socket events
    useEffect(() => {
        if (lastEvent) {
            const newDonation: Donation = {
                ...lastEvent,
                timestamp: Date.now(),
            }

            setPrevTotal((prev) => prev) // In a real scenario, this should track previous total for animation
            setTotalRaisedCents((prev) => {
                const newTotal = prev + lastEvent.amount
                // Trigger Goal Celebration
                const goalCents = Number(event?.goalAmount || 0) * 100
                if (prev < goalCents && newTotal >= goalCents) {
                    import('@core/lib/confetti').then((mod) => mod.fireGoalCelebration())
                }
                return newTotal
            })

            setDonations((prev) => [newDonation, ...prev].slice(0, 8))
        }
    }, [lastEvent, event?.goalAmount])

    // Initial load sync (You might want to fetch initial donations here if API supports it,
    // but for now we rely on socket or initial state if provided by API/EventContext)
    // NOTE: EventContext provides aggregated stats, we should use them for initial state.
    useEffect(() => {
        if (event && event.raised !== undefined) {
            // event.raised is likely in dollars (float) based on service division by 100.
            // We need cents for the gauge/logic.
            const raisedCents = Math.round(Number(event.raised) * 100)
            setTotalRaisedCents(raisedCents)
            setPrevTotal(raisedCents) // Start gauge at current total
        }
    }, [event])

    // Use query param ?layout=gauge|feed|full & ?bg=transparent|green
    const searchParams = new URLSearchParams(window.location.search)
    const layout = searchParams.get('layout') || 'full'
    const bgMode = searchParams.get('bg') || 'transparent'

    // Apply background
    useEffect(() => {
        if (bgMode === 'green') {
            document.body.style.backgroundColor = '#00ff00'
        } else {
            document.body.style.backgroundColor = 'transparent'
        }
        return () => {
            document.body.style.backgroundColor = ''
        }
    }, [bgMode])

    if (isLoading || !event)
        return (
            <div className="flex h-screen items-center justify-center text-white/50">
                {t('common.loading')}
            </div>
        )

    const renderGauge = () => (
        <GaugeClassic
            totalRaisedCents={totalRaisedCents}
            prevTotal={prevTotal}
            goalAmount={Number(event.goalAmount)}
            totalLabel={t('live.total_raised')}
        />
    )

    return (
        <div className="min-h-screen w-full bg-transparent overflow-hidden p-4">
            {layout === 'full' && (
                <div className="grid grid-cols-1 gap-4 h-full">
                    <div className="flex justify-center">{renderGauge()}</div>
                    <div className="h-[200px] relative overflow-hidden mask-fade-bottom">
                        <DonationFeed donations={donations.slice(0, 3)} />
                    </div>
                </div>
            )}

            {layout === 'gauge' && (
                <div className="flex justify-center h-full items-center">{renderGauge()}</div>
            )}

            {layout === 'feed' && (
                <div className="h-full relative overflow-hidden">
                    <DonationFeed donations={donations} />
                </div>
            )}
        </div>
    )
}
