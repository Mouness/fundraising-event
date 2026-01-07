import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import { type GaugeProps } from '../../types';

export const GaugeModern = ({
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
        <div className="w-full space-y-12">
            <div className="relative z-10 space-y-2 text-left">
                <span className="text-zinc-400 font-bold text-lg tracking-widest uppercase mb-4 block">
                    {(totalLabel === 'Total Raised' || !totalLabel) ? t('live.total_raised', 'Total Raised') : totalLabel}
                </span>
                <motion.div
                    key={totalRaisedCents}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl lg:text-9xl font-black tracking-tighter leading-none"
                    style={{ color: 'var(--live-modern-accent, #6366f1)' }}
                >
                    <CountUp
                        start={prevTotal / 100}
                        end={totalRaisedCents / 100}
                        duration={1}
                        separator=","
                        formattingFn={(value) => formatCurrency(value)}
                    />
                </motion.div>
            </div>

            {/* Modern Bar Gauge */}
            <div className="w-full space-y-4">
                <div className="flex justify-between text-lg font-bold uppercase tracking-widest text-zinc-400">
                    <span>{t('live.progress', 'Progress')}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div
                    className="h-12 w-full rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--live-modern-gauge-track, #27272a)' }}
                >
                    <motion.div
                        className="h-full"
                        style={{ backgroundColor: 'var(--live-modern-gauge-fill, #ffffff)' }}
                        initial={{ width: `${goalAmount > 0 ? (prevTotal / (goalAmount * 100)) * 100 : 100}%` }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                    />
                </div>
                <div className="text-right text-base text-zinc-500 font-mono font-bold uppercase">
                    {t('live.goal', 'GOAL')}: {formatCurrency(goalAmount)}
                </div>
            </div>
        </div>
    );
};
