import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { useEventConfig } from '../../event/hooks/useEventConfig';
import { DonationFeed, type Donation } from '../components/DonationFeed';
import { DonationGauge } from '../components/DonationGauge';
import { useLiveSocket } from '../hooks/useLiveSocket';
import { fireConfetti } from '@/lib/confetti';

export const LivePage = () => {
    const { t } = useTranslation('common');
    const { config } = useEventConfig();
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
                return newTotal;
            });

            setDonations((prev) => [newDonation, ...prev].slice(0, 8));
        }
    }, [lastEvent]);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans selection:bg-purple-500 selection:text-white">

            {/* Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            </div>

            <main className="relative z-10 w-full h-screen flex flex-col p-8 lg:p-16">

                {/* Header / Title */}
                <header className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-6">
                        {config.theme?.assets?.logo && (
                            <img
                                src={config.theme.assets.logo}
                                alt="Event Logo"
                                className="h-16 w-auto object-contain rounded-lg bg-white/10 backdrop-blur-sm p-2"
                            />
                        )}
                        <div>
                            <motion.h1
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black tracking-tight text-white uppercase"
                            >
                                {config.content.title || t('live.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg text-slate-400 mt-1"
                            >
                                Give at <span className="text-white font-bold">localhost:5173/donate</span>
                            </motion.p>
                        </div>
                    </div>

                    {/* QR Code */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="hidden lg:flex flex-col items-center bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                    >
                        <QRCode
                            value={`${window.location.protocol}//${window.location.hostname}:${window.location.port}/donate`}
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
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            {t('live.new_donation')}
                        </h2>
                        <DonationFeed donations={donations} />
                    </div>

                </div>
            </main>
        </div>
    );
}
