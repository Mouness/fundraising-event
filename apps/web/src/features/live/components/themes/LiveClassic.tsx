import { motion } from 'framer-motion'
import { useTranslation, Trans } from 'react-i18next'
import QRCode from 'react-qr-code'
import { DonationFeed } from '../DonationFeed'
import { GaugeClassic } from '../gauges/GaugeClassic'
import type { LiveThemeProps } from '../../types'

export const LiveClassic = ({
    config,
    donations,
    totalRaisedCents,
    prevTotal,
    activeSlug,
}: LiveThemeProps) => {
    const { t } = useTranslation('common')
    const bgImage = config.theme?.assets?.backgroundLive

    return (
        <div
            className="min-h-screen overflow-hidden relative font-sans selection:bg-primary selection:text-primary-foreground bg-cover bg-center bg-no-repeat w-full"
            style={{
                backgroundColor: 'var(--live-classic-bg, #000)',
                color: 'var(--live-text-main, #fff)',
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            }}
        >
            {/* Animated Background (Only if no image, or as an overlay) */}
            {!bgImage && (
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full animate-pulse-slow mix-blend-screen"
                        style={{
                            backgroundColor: 'var(--live-classic-bg-accent-1, #4f46e5)',
                            filter: 'blur(100px)',
                            opacity: 0.3,
                        }}
                    ></div>
                    <div
                        className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] rounded-full animate-pulse-slow delay-1000 mix-blend-screen"
                        style={{
                            backgroundColor: 'var(--live-classic-bg-accent-2, #ec4899)',
                            filter: 'blur(100px)',
                            opacity: 0.3,
                        }}
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
                                style={{
                                    backgroundColor: 'var(--glass-bg, rgba(255,255,255,0.1))',
                                    backdropFilter: 'blur(10px)',
                                }}
                            />
                        )}
                        <div>
                            <motion.h1
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black tracking-tight uppercase"
                                style={{ color: 'var(--live-text-title, #fff)' }}
                            >
                                {config.content.title || config.name || t('live.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg mt-1"
                                style={{ color: 'var(--live-text-subtitle, #ccc)' }}
                            >
                                {config.description || t('live.subtitle')}
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.7 }}
                                className="text-lg mt-1"
                                style={{ color: 'var(--live-text-subtitle, #ccc)' }}
                            >
                                <Trans
                                    i18nKey="live.give_at"
                                    values={{
                                        url: `${window.location.host}/${activeSlug}/donate`,
                                    }}
                                    components={{
                                        1: (
                                            <span
                                                className="font-bold"
                                                style={{
                                                    color: 'var(--live-classic-highlight-color, #fff)',
                                                }}
                                            />
                                        ),
                                    }}
                                />
                            </motion.p>
                        </div>
                    </div>

                    {/* QR Code */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="hidden lg:flex flex-col items-center p-4 bg-white rounded-xl shadow-2xl"
                        style={{
                            boxShadow:
                                '0 0 30px var(--live-classic-qr-shadow, rgba(255,255,255,0.2))',
                        }}
                    >
                        <QRCode
                            value={`${window.location.protocol}//${window.location.host}/${activeSlug}/donate`}
                            size={120}
                            bgColor="var(--live-qr-bg, #ffffff)"
                            fgColor="var(--live-qr-fg, #000000)"
                        />
                        <span className="text-black font-bold text-xs mt-2 tracking-widest uppercase">
                            {t('live.scan_to_donate')}
                        </span>
                    </motion.div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* CENTER STAGE: GAUGE & TOTAL */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
                        <GaugeClassic
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
                                style={{
                                    backgroundColor: 'var(--live-status-indicator, #22c55e)',
                                }}
                            ></div>
                            {t('live.new_donation')}
                        </h2>
                        <DonationFeed donations={donations} />
                    </div>
                </div>
            </main>
        </div>
    )
}
