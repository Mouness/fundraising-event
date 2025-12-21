import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export interface Donation {
    amount: number; // in cents
    currency: string;
    donorName: string;
    message?: string;
    isAnonymous: boolean;
    timestamp: number;
}

interface DonationFeedProps {
    donations: Donation[];
}

export const DonationFeed = ({ donations }: DonationFeedProps) => {
    const { t } = useTranslation('common');

    return (
        <div className="flex-1 overflow-hidden relative fade-mask-bottom">
            <AnimatePresence mode="popLayout">
                {donations.map((d) => (
                    <motion.div
                        key={`${d.donorName}-${d.timestamp}`}
                        layout
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="mb-4"
                    >
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl flex justify-between items-center shadow-lg relative overflow-hidden group">

                            {/* Glow Effect on Hover/Entry */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex items-center gap-4 z-10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg font-bold">
                                    {d.isAnonymous ? '?' : d.donorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-white leading-tight">
                                        {d.isAnonymous ? t('live.anonymous') : d.donorName}
                                    </p>
                                    {d.message && (
                                        <p className="text-slate-400 text-sm line-clamp-1 italic max-w-[200px]">
                                            "{d.message}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-2xl font-bold text-green-400 z-10">
                                +${(d.amount / 100).toLocaleString()}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {donations.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 animate-spin-slow"></div>
                    <p>{t('live.waiting')}</p>
                </div>
            )}
        </div>
    );
}
