import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import { type GaugeProps } from '../../types';

export const GaugeElegant = ({
    totalRaisedCents,
    prevTotal,
    goalAmount,
    totalLabel
}: GaugeProps) => {
    const { t } = useTranslation('common');
    const { formatCurrency } = useCurrencyFormatter();
    const percentage = goalAmount > 0 ? (totalRaisedCents / (goalAmount * 100)) * 100 : 100;
    const progressPercentage = Math.min(percentage, 100);

    return (
        <div className="relative w-[500px] h-[500px] flex items-center justify-center">
            {/* Decorative Rings */}
            <div className="absolute inset-0 border border-slate-800 rounded-full scale-110"></div>
            <div className="absolute inset-0 border border-slate-800 rounded-full scale-125 opacity-50"></div>

            <svg className="w-full h-full transform -rotate-90">
                {/* Track */}
                <circle cx="50%" cy="50%" r="48%" stroke="#1e293b" strokeWidth="2" fill="none" />
                {/* Progress Gold */}
                <motion.circle
                    cx="50%" cy="50%" r="48%"
                    stroke="url(#goldGeneric)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="butt"
                    strokeDasharray="301" // Approx 2 * pi * 48
                    initial={{ strokeDashoffset: 301 }}
                    animate={{ strokeDashoffset: 301 - (301 * progressPercentage) / 100 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    pathLength={1}
                    style={{ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - progressPercentage / 100 }}
                />
                <defs>
                    <linearGradient id="goldGeneric" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--live-elegant-gold, #d4af37)" />
                        <stop offset="50%" stopColor="var(--live-elegant-gold-light, #fcd34d)" />
                        <stop offset="100%" stopColor="var(--live-elegant-gold, #d4af37)" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute flex flex-col items-center text-center">
                <span
                    className="text-amber-500 text-sm tracking-[0.3em] uppercase mb-2 font-sans border-b border-amber-500/30 pb-1"
                    style={{
                        color: 'var(--live-elegant-gold, #d4af37)',
                        borderColor: 'var(--live-elegant-gold, #d4af37)'
                    }}
                >
                    {(totalLabel === 'Total Raised' || !totalLabel) ? t('live.total_raised', 'Total Raised') : totalLabel}
                </span>
                <div className="text-7xl font-serif text-slate-100">
                    <CountUp
                        start={prevTotal / 100}
                        end={totalRaisedCents / 100}
                        duration={3}
                        separator=","
                        decimals={0}
                        formattingFn={(value) => formatCurrency(value)}
                    />
                </div>
                <div className="mt-4 text-slate-500 font-sans text-xs tracking-widest uppercase">
                    {t('live.target', 'Target')}: {formatCurrency(goalAmount)}
                </div>
            </div>
        </div>
    );
};
