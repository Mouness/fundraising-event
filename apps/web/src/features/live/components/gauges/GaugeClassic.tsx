import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useTranslation } from 'react-i18next'
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter'

import { type GaugeProps } from '../../types'

export const GaugeClassic = ({
    totalRaisedCents,
    prevTotal,
    goalAmount,
    totalLabel,
}: GaugeProps) => {
    const { t } = useTranslation('common')
    const { formatCurrency } = useCurrencyFormatter()
    const percentage = goalAmount > 0 ? (totalRaisedCents / (goalAmount * 100)) * 100 : 100
    const progressPercentage = Math.min(percentage, 100)

    return (
        <div className="relative w-[500px] h-[500px]">
            <svg
                className="w-full h-full transform -rotate-90 filter"
                style={{ filter: 'drop-shadow(0 0 15px var(--live-gauge-shadow))' }}
            >
                {/* Track */}
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="var(--live-gauge-track)"
                    strokeWidth="12"
                    fill="none"
                />
                {/* Progress */}
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progressPercentage) / 100}
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * progressPercentage) / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    pathLength={1}
                    style={{
                        pathLength: 1,
                        strokeDasharray: 1,
                        strokeDashoffset: 1 - progressPercentage / 100,
                    }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--live-gauge-from, var(--primary))" />
                        <stop offset="100%" stopColor="var(--live-gauge-to, var(--secondary))" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                    className="text-6xl font-black tabular-nums tracking-tighter bg-clip-text text-transparent"
                    style={{
                        backgroundImage:
                            'linear-gradient(to bottom, var(--live-classic-counter-gradient-from), var(--live-classic-counter-gradient-to))',
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <CountUp
                        start={prevTotal / 100}
                        end={totalRaisedCents / 100}
                        duration={2.5}
                        separator=","
                        decimals={0}
                        formattingFn={(value) => formatCurrency(value)}
                    />
                </motion.div>
                <div
                    className="mt-4 px-6 py-2 rounded-full border text-sm font-medium tracking-widest uppercase"
                    style={{
                        backgroundColor: 'var(--live-badge-bg, var(--glass-bg))',
                        backdropFilter: 'blur(var(--glass-blur))',
                        borderColor: 'var(--live-badge-border, var(--glass-border))',
                        color: 'var(--live-badge-text, var(--live-text-secondary))',
                    }}
                >
                    {totalLabel || t('live.total_raised')}
                </div>
                <div
                    className="mt-2 text-xs uppercase tracking-widest"
                    style={{ color: 'var(--live-text-muted)' }}
                >
                    {t('live.goal')}: {formatCurrency(goalAmount)}
                </div>
            </div>
        </div>
    )
}
