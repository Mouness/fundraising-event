import { DonationFeed } from '../DonationFeed'
import { GaugeModern } from '../gauges/GaugeModern'
import type { LiveThemeProps } from '../../types'
import QRCode from 'react-qr-code'
import { useTranslation } from 'react-i18next'

export const LiveModern = ({
    config,
    donations,
    totalRaisedCents,
    prevTotal,
    activeSlug,
}: LiveThemeProps) => {
    const { t } = useTranslation('common')
    const bgImage = config.theme?.assets?.backgroundLive

    // Use a robust fallback background if variables aren't set
    const bgStyle = {
        backgroundColor: 'var(--live-modern-bg, #09090b)', // zinc-950
        color: 'var(--live-modern-text, #ffffff)',
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }

    return (
        <div
            className="live-theme-modern w-full min-h-screen flex flex-col lg:flex-row font-sans selection:bg-indigo-500 selection:text-white relative"
            style={bgStyle}
        >
            {/* Background Overlay if image exists */}
            {bgImage && <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none" />}

            {/* LEFT PANEL: Hero & Stats */}
            {/* Mobile: min-h-[60vh] to ensure space. Desktop: h-screen sticky to keep it fixed while feed might scroll if needed (though feed has internal scroll) */}
            <div className="relative w-full lg:w-[60%] min-h-[60vh] lg:h-screen flex flex-col p-6 lg:p-16 overflow-hidden z-10 border-b lg:border-b-0 lg:border-r border-white/10">
                {/* Background Ambient Mesh - Only show if NO bg image, or make it subtle? 
                    If bgImage exists, we might want to hide distinct gradients to avoid clashing, 
                    or keep them as subtle tints. Let's keep them but lower opacity if image exists.
                */}
                <div
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(circle at 20% 20%, var(--live-modern-accent, #6366f1) 0%, transparent 50%)',
                        opacity: bgImage ? 0.1 : 0.2, // Reduce opacity if image is there
                    }}
                />

                {/* Header */}
                <header className="relative z-10 flex items-center gap-4 mb-4 lg:mb-auto">
                    {config.theme?.assets?.logo && (
                        <div className="bg-white/5 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-sm">
                            <img
                                src={config.theme.assets.logo}
                                alt="Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                    )}
                    <h1 className="text-xl lg:text-3xl font-bold tracking-tight uppercase opacity-90 truncate">
                        {config.content.title || config.name}
                    </h1>
                </header>

                {/* Main Gauge Content - Vertically Centered */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-8 lg:py-0">
                    {/* Wrapped in a max-width container to prevent blowout */}
                    <div className="w-full max-w-4xl">
                        <GaugeModern
                            totalRaisedCents={totalRaisedCents}
                            prevTotal={prevTotal}
                            goalAmount={config.content.goalAmount}
                            totalLabel={config.content.totalLabel}
                        />
                    </div>
                </div>

                {/* Footer / QR Code */}
                <div className="relative z-10 mt-auto pt-4 lg:pt-0">
                    <div className="bg-white text-black p-1.5 rounded-2xl inline-flex items-center shadow-2xl max-w-full overflow-hidden">
                        {/* QR Box */}
                        <div className="bg-neutral-50 p-2 rounded-xl border-2 border-dashed border-neutral-300 shrink-0">
                            <QRCode
                                value={`${window.location.protocol}//${window.location.host}/${activeSlug}/donate`}
                                size={100}
                                bgColor="var(--live-modern-qr-bg, #fafafa)"
                                fgColor="var(--live-modern-qr-fg, #000000)"
                            />
                        </div>

                        {/* CTA Text */}
                        <div className="px-5 flex flex-col justify-center min-w-0">
                            <span className="text-[10px] lg:text-xs font-bold tracking-widest text-indigo-600 uppercase mb-0.5">
                                {t('live.join_the_impact', 'Join the Impact')}
                            </span>
                            <span className="text-xl lg:text-2xl font-black uppercase tracking-tight leading-none whitespace-nowrap">
                                {t('live.scan_to_donate', 'Scan to Donate')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Feed */}
            {/* Mobile: flex-1 (fills rest). Desktop: w-[40%] h-screen */}
            <div className="w-full lg:w-[40%] h-[50vh] lg:h-screen bg-zinc-50 relative flex flex-col shadow-2xl z-20">
                {/* Feed Header */}
                <div className="p-6 border-b border-zinc-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center shadow-sm">
                    <h2 className="text-lg lg:text-xl font-black uppercase tracking-wide text-zinc-900 flex items-center gap-3">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        {t('live.live_feed', 'Live Feed')}
                    </h2>
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                        {donations.length}
                    </span>
                </div>

                {/* Feed List */}
                <div className="flex-1 relative overflow-hidden bg-zinc-50/50">
                    {/* Fade Masks */}
                    <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-zinc-50 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-zinc-50 to-transparent z-10 pointer-events-none" />

                    <div className="h-full overflow-y-auto px-4 lg:px-6 py-4 pb-24 modern-feed-scroll">
                        <DonationFeed donations={donations} />
                    </div>
                </div>
            </div>
        </div>
    )
}
