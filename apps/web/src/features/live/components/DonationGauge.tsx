import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useTranslation } from 'react-i18next';

interface DonationGaugeProps {
    totalRaisedCents: number;
    prevTotal: number;
    goalAmount: number;
    primaryColor: string;
    secondaryColor: string;
    totalLabel?: string;
}

export const DonationGauge = ({
    totalRaisedCents,
    prevTotal,
    goalAmount,
    primaryColor,
    secondaryColor,
    totalLabel
}: DonationGaugeProps) => {
    const { t } = useTranslation('common');
    const progressPercentage = Math.min((totalRaisedCents / (goalAmount * 100)) * 100, 100);

    return (
        <div className="relative w-[500px] h-[500px]">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                {/* Track */}
                <circle cx="50%" cy="50%" r="45%" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                {/* Progress */}
                <motion.circle
                    cx="50%" cy="50%" r="45%"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="283" // approximate
                    strokeDashoffset={283 - (283 * progressPercentage) / 100}
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * progressPercentage) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    pathLength={1}
                    style={{ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - progressPercentage / 100 }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={primaryColor} />
                        <stop offset="100%" stopColor={secondaryColor} />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                    className="text-8xl font-black tabular-nums tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    $<CountUp
                        start={prevTotal / 100}
                        end={totalRaisedCents / 100}
                        duration={2.5}
                        separator=","
                        decimals={0}
                    />
                </motion.div>
                <div className="mt-4 px-6 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-sm font-medium tracking-widest uppercase text-slate-300">
                    {totalLabel || t('live.total_raised')}
                </div>
                <div className="mt-2 text-slate-500 text-xs uppercase tracking-widest">
                    {t('live.goal')}: ${goalAmount.toLocaleString()}
                </div>
            </div>
        </div>
    );
}
