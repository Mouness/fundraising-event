import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

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
    const { formatCurrency } = useCurrencyFormatter();

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
                        <div
                            className="p-5 rounded-2xl flex justify-between items-center shadow-lg relative overflow-hidden group border"
                            style={{ backgroundColor: 'var(--live-feed-item-bg)', borderColor: 'var(--live-feed-item-border)', backdropFilter: 'blur(var(--glass-blur))' }}
                        >

                            {/* Glow Effect on Hover/Entry */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex items-center gap-4 z-10">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                                    style={{ background: 'linear-gradient(to bottom right, var(--live-avatar-bg-start), var(--live-avatar-bg-end))' }}
                                >
                                    {d.isAnonymous ? '?' : d.donorName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold leading-tight" style={{ color: 'var(--live-text-main)' }}>
                                        {d.isAnonymous ? t('live.anonymous') : d.donorName}
                                    </p>
                                    {d.message && (
                                        <p
                                            className="text-sm line-clamp-1 italic max-w-[200px]"
                                            style={{ color: 'var(--live-text-secondary)' }}
                                        >
                                            "{d.message}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div
                                className="text-2xl font-bold z-10"
                                style={{ color: 'var(--live-amount-color)' }}
                            >
                                +{formatCurrency((d.amount / 100), { currency: d.currency })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {donations.length === 0 && (
                <div
                    className="h-full flex flex-col items-center justify-center space-y-4"
                    style={{ color: 'var(--live-text-muted)' }}
                >
                    <div className="w-16 h-16 rounded-full border-2 border-dashed animate-spin-slow" style={{ borderColor: 'var(--live-text-muted)' }}></div>
                    <p>{t('live.waiting')}</p>
                </div>
            )}
        </div>
    );
}
