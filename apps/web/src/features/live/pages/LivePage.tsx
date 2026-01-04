import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import QRCode from 'react-qr-code';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { DonationFeed, type Donation } from '@/features/live/components/DonationFeed';
import { DonationGauge } from '@/features/live/components/DonationGauge';
import { useLiveSocket } from '@/features/live/hooks/useLiveSocket';
import { fireConfetti } from '@/lib/confetti';

export const LivePage = () => {
    const { t } = useTranslation('common');
    const { config } = useAppConfig();
    const { slug } = useParams<{ slug: string }>();
    const activeSlug = slug || config.slug || 'default';

    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalRaisedCents, setTotalRaisedCents] = useState(0);
    const [prevTotal, setPrevTotal] = useState(0);

    const { lastEvent } = useLiveSocket(config.id || 'default'); // Assuming event ID or slug is needed

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
                    import('@/lib/confetti').then(mod => mod.fireGoalCelebration());
                }
                return newTotal;
            });

            setDonations((prev) => [newDonation, ...prev].slice(0, 8));
        }
    }, [lastEvent, config.content.goalAmount]);

    const bgImage = config.theme?.assets?.backgroundLive;

    return (
        <div
            className="min-h-screen overflow-hidden relative font-sans selection:bg-purple-500 selection:text-white bg-cover bg-center bg-no-repeat"
            style={{
                backgroundColor: 'var(--live-page-bg)',
                color: 'var(--live-text-main)',
                backgroundImage: bgImage ? `url(${bgImage})` : undefined
            }}
        >

            {/* Animated Background (Only if no image, or as an overlay) */}
            {!bgImage && (
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full animate-pulse-slow mix-blend-screen"
                        style={{ backgroundColor: 'var(--live-bg-accent-1)', filter: 'blur(var(--live-bg-blur))' }}
                    ></div>
                    <div
                        className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full animate-pulse-slow delay-1000 mix-blend-screen"
                        style={{ backgroundColor: 'var(--live-bg-accent-2)', filter: 'blur(var(--live-bg-blur))' }}
                    ></div>
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                </div>
            )}

            {/* Overlay for readability if image exists */}
            {bgImage && <div className="absolute inset-0 bg-black/60 z-0" />}

            <main className="relative z-10 w-full h-screen flex flex-col p-8 lg:p-16">

                {/* Header / Title */}
                <header className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-6">
                        {config.theme?.assets?.logo && (
                            <img
                                src={config.theme.assets.logo}
                                alt="Event Logo"
                                className="h-16 w-auto object-contain rounded-lg p-2"
                                style={{ backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))' }}
                            />
                        )}
                        <div>
                            <motion.h1
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black tracking-tight uppercase"
                                style={{ color: 'var(--live-title-color)' }}
                            >
                                {config.content.title || t('live.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg mt-1"
                                style={{ color: 'var(--live-subtitle-text)' }}
                            >
                                <Trans
                                    i18nKey="live.give_at"
                                    values={{ url: `${window.location.host}/${activeSlug}/donate` }}
                                    components={{ 1: <span className="font-bold" style={{ color: 'var(--live-highlight-color)' }} /> }}
                                />
                            </motion.p>
                        </div>
                    </div>

                    {/* QR Code */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="hidden lg:flex flex-col items-center p-4 rounded-xl"
                        style={{ backgroundColor: 'var(--live-qr-bg)', boxShadow: '0 0 30px var(--live-qr-shadow)' }}
                    >
                        <QRCode
                            value={`${window.location.protocol}//${window.location.host}/${activeSlug}/donate`}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#000000"
                        />
                        <span className="text-black font-bold text-xs mt-2 tracking-widest uppercase">{t('live.scan_to_donate')}</span>
                    </motion.div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* CENTER STAGE: GAUGE & TOTAL */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                        <DonationGauge
                            totalRaisedCents={totalRaisedCents}
                            prevTotal={prevTotal}
                            goalAmount={config.content.goalAmount}
                            totalLabel={config.content.totalLabel}
                        />
                    </div>

                    {/* RIGHT SIDE: FEED */}
                    <div className="lg:col-span-5 h-[600px] flex flex-col">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full animate-pulse"
                                style={{ backgroundColor: 'var(--live-status-indicator)' }}
                            ></div>
                            {t('live.new_donation')}
                        </h2>
                        <DonationFeed donations={donations} />
                    </div>

                </div>
            </main>
        </div>
    );
}
