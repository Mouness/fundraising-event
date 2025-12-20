import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CountUp from 'react-countup';
import confetti from 'canvas-confetti';
import QRCode from 'react-qr-code';

interface Donation {
    amount: number; // in cents
    currency: string;
    donorName: string;
    message?: string;
    isAnonymous: boolean;
    timestamp: number;
}

const EVENT_GOAL_CENTS = 1000000; // $10,000.00

export function LivePage() {
    const { t } = useTranslation('common');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalRaisedCents, setTotalRaisedCents] = useState(0);
    const [prevTotal, setPrevTotal] = useState(0);

    // MOCK THEME CONFIGURATION (Later fetch from API)
    const [themeConfig] = useState({
        title: "Winter Gala 2025",
        totalLabel: "Funds Raised",
        goalAmount: 10000, // $10,000
        primaryColor: "#ec4899", // Pink-500
        secondaryColor: "#8b5cf6" // Violet-500
    });

    // Audio ref for notification sound (optional, for future)
    // const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
            withCredentials: true,
        });

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        newSocket.on('donation.created', (data: any) => {
            const newDonation: Donation = {
                ...data,
                timestamp: Date.now(),
            };

            setPrevTotal((prev) => prev); // Capture current before update for CountUp
            setTotalRaisedCents((prev) => {
                const newTotal = prev + data.amount;
                // Trigger confetti if significant donation
                if (data.amount >= 5000) { // $50+
                    fireConfetti();
                }
                return newTotal;
            });

            setDonations((prev) => [newDonation, ...prev].slice(0, 8)); // Keep last 8

            // Optional: audioRef.current?.play();
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const fireConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const progressPercentage = Math.min((totalRaisedCents / (themeConfig.goalAmount * 100)) * 100, 100);

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
                    <div>
                        <motion.h1
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl font-black tracking-tight text-white uppercase"
                        >
                            {themeConfig.title || t('live.title')}
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
                        <span className="text-black font-bold text-xs mt-2 tracking-widest uppercase">Scan to Donate</span>
                    </motion.div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* CENTER STAGE: GAUGE & TOTAL */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                        {/* Gauge SVG */}
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
                                    pathLength={1} // Use relative units for easier calculation if desired, but here specific pixel dasharray
                                    style={{ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - progressPercentage / 100 }}
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={themeConfig.primaryColor} />
                                        <stop offset="100%" stopColor={themeConfig.secondaryColor} />
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
                                    {themeConfig.totalLabel || 'Total Raised'}
                                </div>
                                <div className="mt-2 text-slate-500 text-xs uppercase tracking-widest">
                                    Goal: ${themeConfig.goalAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: FEED */}
                    <div className="lg:col-span-5 h-[600px] flex flex-col">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            {t('live.new_donation')}
                        </h2>

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
                    </div>

                </div>
            </main>
        </div>
    );
}
