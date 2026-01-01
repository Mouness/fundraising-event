import { Link } from 'react-router-dom';
import { Calendar, Target, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LandingBackground } from '@/features/public/components/LandingBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEvents } from '@/features/events/hooks/useEvents';
import { PageLoader } from '@/components/ui/PageLoader';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { motion, useScroll, useTransform } from 'framer-motion';

export const RootLandingPage = () => {
    const { events, isLoading } = useEvents();
    const { config } = useAppConfig();
    const { t } = useTranslation('common');
    const { scrollY } = useScroll();

    // Parallax effect
    const y = useTransform(scrollY, [0, 500], [0, 200]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><PageLoader /></div>;
    }

    return (
        <div className="min-h-screen relative font-sans overflow-hidden bg-background text-foreground transition-colors duration-500">
            {/* Animated Background Mesh */}
            <LandingBackground />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Hero Section */}
                <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 relative">
                    <motion.div
                        style={{ y }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center space-y-8 max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">{t('root_landing.hero.badge', 'Impact Platform')}</span>
                        </div>

                        <h1
                            className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-[0.9]"
                            style={{ color: 'var(--hero-title, var(--foreground))' }}
                        >
                            {config.content.title}
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance opacity-80 font-light leading-relaxed">
                            {t('root_landing.hero.subtitle', 'Discover and support our fundraising campaigns.')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 backdrop-blur-md bg-primary/90 text-primary-foreground hover:bg-primary"
                                onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                {t('root_landing.hero.explore', 'Explore Events')}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <ChevronDown className="w-10 h-10 text-primary/40 hover:text-primary transition-colors duration-300" />
                    </motion.div>
                </section>

                {/* Event Grid Section */}
                <section id="events-section" className="container mx-auto px-4 py-32">
                    <div className="flex items-end justify-between mb-16 border-b border-border/40 pb-6">
                        <div>
                            <h2 className="text-4xl font-bold tracking-tight mb-2">{t('root_landing.events.title', 'Active Campaigns')}</h2>
                            <p className="text-muted-foreground">{t('root_landing.events.subtitle', 'Join the cause and make a difference.')}</p>
                        </div>
                        <div className="hidden md:block text-sm text-muted-foreground">
                            {t('root_landing.events.showing_count', { count: events.length, defaultValue: `Showing ${events.length} events` })}
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event, index) => {
                            const raised = event.raised || 0;
                            const goal = event.goalAmount || 1;
                            const progress = Math.min(100, Math.round((raised / goal) * 100));

                            return (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Link to={`/${event.slug || event.id}`} className="group block h-full">
                                        <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative group-hover:-translate-y-2"
                                            style={{
                                                backgroundColor: 'hsl(var(--landing-card-glass-bg) / var(--landing-card-glass-alpha))',
                                                borderColor: 'hsl(var(--landing-card-glass-border) / var(--landing-card-glass-border-alpha))'
                                            }}
                                        >
                                            {/* Glow Effect on Hover */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                                style={{ background: 'linear-gradient(to bottom right, hsl(var(--landing-hero-gradient-primary) / 0.1), transparent)' }}
                                            />

                                            <CardHeader className="relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                                        {t('root_landing.event_card.active', 'Active')}
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                                                    {event.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 pt-2 text-base">
                                                    <Calendar className="h-4 w-4" />
                                                    {event.date ? new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Upcoming Event'}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="space-y-6 relative z-10 pb-8">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{t('root_landing.event_card.raised', 'Raised')}</span>
                                                            <span className="text-2xl font-bold text-foreground">
                                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(raised)}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold text-primary">{progress}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Custom Progress Bar */}
                                                    <div className="h-3 w-full bg-secondary/20 rounded-full overflow-hidden backdrop-blur-sm">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${progress}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            className="h-full bg-gradient-to-r from-primary to-primary/80 relative"
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                        </motion.div>
                                                    </div>

                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{t('root_landing.event_card.goal_of', { amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(event.goalAmount), defaultValue: `of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(event.goalAmount)} goal` })}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    {events.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
                            <Target className="w-16 h-16 text-muted-foreground" />
                            <p className="text-xl font-medium">{t('root_landing.empty', 'No active campaigns found.')}</p>
                        </div>
                    )}
                </section>

                {/* Minimal Footer */}
                <footer className="py-12 mt-auto border-t border-border/10 bg-background/50 backdrop-blur-xl">
                    <div className="container mx-auto px-4 flex flex-col items-center gap-6">
                        <LanguageSwitcher />

                        <p className="text-sm text-muted-foreground font-light text-center">
                            © {new Date().getFullYear()} <span className="font-semibold text-foreground playfair">{config.communication?.legalName || 'Fundraising Platform'}</span>. {t('root_landing.footer.rights', 'All rights reserved.')}
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};
