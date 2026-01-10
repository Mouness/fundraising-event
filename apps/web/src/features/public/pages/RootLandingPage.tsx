import { Target, Sparkles, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@core/components/ui/button'
import { PublicLayout } from '@features/public/layouts/PublicLayout'
import { PublicEventCard } from '@features/public/components/PublicEventCard'
import { usePublicEvents } from '@features/events/hooks/usePublicEvents'
import { PageLoader } from '@core/components/ui/page-loader'
import { useAppConfig } from '@core/providers/AppConfigProvider'
import { motion, useScroll, useTransform } from 'framer-motion'

export const RootLandingPage = () => {
    const { events, isLoading } = usePublicEvents()
    const { config } = useAppConfig()
    const { t } = useTranslation('common')
    const { scrollY } = useScroll()

    // Parallax effect
    const y = useTransform(scrollY, [0, 500], [0, 200])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PageLoader />
            </div>
        )
    }

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 relative">
                <motion.div
                    style={{ y }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center space-y-8 max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary uppercase tracking-wider">
                            {t('root_landing.hero.badge', 'Impact Platform')}
                        </span>
                    </div>

                    <h1
                        className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-[0.9]"
                        style={{ color: 'var(--hero-title, var(--foreground))' }}
                    >
                        {config.content.title}
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance opacity-80 font-light leading-relaxed">
                        {t(
                            'root_landing.hero.subtitle',
                            'Discover and support our fundraising campaigns.',
                        )}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button
                            size="lg"
                            className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 backdrop-blur-md bg-primary/90 text-primary-foreground hover:bg-primary"
                            onClick={() =>
                                document
                                    .getElementById('events-section')
                                    ?.scrollIntoView({ behavior: 'smooth' })
                            }
                        >
                            {t('root_landing.hero.explore', 'Explore Events')}
                        </Button>
                    </div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    onClick={() =>
                        document
                            .getElementById('events-section')
                            ?.scrollIntoView({ behavior: 'smooth' })
                    }
                >
                    <ChevronDown className="w-10 h-10 text-primary/40 hover:text-primary transition-colors duration-300" />
                </motion.div>
            </section>

            {/* Event Grid Section */}
            <section id="events-section" className="container mx-auto px-4 py-32">
                <div className="flex items-end justify-between mb-16 border-b border-border/40 pb-6">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-2">
                            {t('root_landing.events.title', 'Active Campaigns')}
                        </h2>
                        <p className="text-muted-foreground">
                            {t(
                                'root_landing.events.subtitle',
                                'Join the cause and make a difference.',
                            )}
                        </p>
                    </div>
                    <div className="hidden md:block text-sm text-muted-foreground">
                        {t('root_landing.events.showing_count', {
                            count: events.length,
                            defaultValue: `Showing ${events.length} events`,
                        })}
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event, index) => (
                        <PublicEventCard key={event.id} event={event} index={index} />
                    ))}
                </div>

                {events.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
                        <Target className="w-16 h-16 text-muted-foreground" />
                        <p className="text-xl font-medium">
                            {t('root_landing.empty', 'No active campaigns found.')}
                        </p>
                    </div>
                )}
            </section>
        </PublicLayout>
    )
}
