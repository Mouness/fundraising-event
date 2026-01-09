import { DonationFeed } from '../DonationFeed'
import { GaugeElegant } from '../gauges/GaugeElegant'
import type { LiveThemeProps } from '../../types'
import QRCode from 'react-qr-code'
import { useTranslation } from 'react-i18next'

export const LiveElegant = ({
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
            className="live-theme-elegant min-h-screen overflow-hidden relative font-serif selection:bg-amber-100 selection:text-amber-900 w-full"
            style={{
                backgroundColor: 'var(--live-elegant-bg, #0f172a)',
                color: 'var(--live-elegant-text, #f8fafc)',
                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Background Overlay if image exists to maintain readability */}
            {bgImage && (
                <div className="absolute inset-0 bg-slate-900/80 z-0 pointer-events-none" />
            )}

            {/* Elegant Background Pattern - Only if no BG Image */}
            {!bgImage && (
                <div
                    className="absolute inset-0 z-0 opacity-20"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                ></div>
            )}

            {/* Gold Glows - Keep these as they add atmosphere, but maybe reduce opacity if BG image is present */}
            <div
                className={`absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none ${bgImage ? 'opacity-50' : ''}`}
            ></div>
            <div
                className={`absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none ${bgImage ? 'opacity-50' : ''}`}
            ></div>

            <main className="relative z-10 w-full h-screen flex flex-col p-8 lg:p-12">
                {/* Header: Centered & Sophisticated */}
                <header className="flex flex-col items-center mb-12 text-center pointer-events-none">
                    {config.theme?.assets?.logo && (
                        <img
                            src={config.theme.assets.logo}
                            alt="Event Logo"
                            className="h-20 w-auto object-contain mb-6 drop-shadow-2xl"
                        />
                    )}
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent mb-6"></div>
                    <h1 className="text-3xl lg:text-4xl font-light tracking-wide text-amber-50 leading-tight">
                        {config.content.title || config.name}
                    </h1>
                    <p className="text-slate-400 italic mt-2 font-sans text-sm tracking-widest uppercase">
                        {config.description}
                    </p>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: QR & Info */}
                    <div className="hidden lg:flex lg:col-span-3 flex-col justify-end h-full pb-12">
                        <div
                            className="backdrop-blur-sm border border-slate-700/50 p-6 rounded-none text-center"
                            style={{
                                backgroundColor:
                                    'var(--live-elegant-card-bg, rgba(30, 41, 59, 0.5))',
                            }}
                        >
                            <div className="bg-white p-3 inline-block shadow-lg mb-4">
                                <QRCode
                                    value={`${window.location.protocol}//${window.location.host}/${activeSlug}/donate`}
                                    size={100}
                                    bgColor="var(--live-elegant-qr-bg, #ffffff)"
                                    fgColor="var(--live-elegant-qr-fg, #000000)"
                                />
                            </div>
                            <p className="text-amber-100/80 font-serif italic text-lg">
                                {t('live.scan_to_contribute', 'Scan to contribute')}
                            </p>
                        </div>
                    </div>

                    {/* Center Column: The Gauge (Circular Gold) */}
                    <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
                        <GaugeElegant
                            totalRaisedCents={totalRaisedCents}
                            prevTotal={prevTotal}
                            goalAmount={config.content.goalAmount}
                            totalLabel={config.content.totalLabel}
                        />
                    </div>

                    {/* Right Column: Feed */}
                    <div className="lg:col-span-3 h-[500px] flex flex-col relative">
                        <div className="absolute top-0 left-0 w-1 h-12 bg-amber-500/50"></div>
                        <h2 className="text-xl font-serif text-amber-50 mb-8 pl-4">
                            {t('live.recent_gifts', 'Recent Gifts')}
                        </h2>
                        <div
                            className="flex-1 overflow-hidden"
                            style={
                                {
                                    maskImage: 'linear-gradient(to bottom, black 80%, transparent)',
                                } as React.CSSProperties
                            }
                        >
                            <DonationFeed donations={donations} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
