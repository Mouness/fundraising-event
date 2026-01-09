import { PublicLayout } from '@features/public/layouts/PublicLayout';
import { FeatureCard } from '@features/public/components/FeatureCard';
import { Button } from '@core/components/ui/button';
import { Globe, Heart, Tv, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { useCurrencyFormatter } from '@core/hooks/useCurrencyFormatter';
import { Link, useParams } from 'react-router-dom';

export const LandingPage = () => {
    const { config } = useAppConfig();
    const { t } = useTranslation('common');
    const { slug } = useParams<{ slug: string }>();

    const { formatCurrency } = useCurrencyFormatter();
    const formattedGoal = formatCurrency(config.content.goalAmount);

    return (
        <PublicLayout>
            <div className="flex-grow flex flex-col items-center justify-center p-4 relative">
                <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
                    <Link to="/">
                        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            {t('landing.back_to_events', 'Back to all events')}
                        </Button>
                    </Link>
                </div>

                <div className="w-full max-w-4xl flex flex-col items-center text-center gap-8 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">

                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-balance leading-tight" style={{ color: 'hsl(var(--landing-hero-text, inherit))' }}>
                            {t('landing.hero.welcome')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{config.content.title}</span>
                        </h2>
                        <p className="text-lg md:text-2xl max-w-2xl mx-auto text-balance opacity-80 font-light">
                            {t('landing.hero.description', { goal: formattedGoal })}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md pt-8">
                        <Link to={`/${slug}/donate`} className="w-full">
                            <Button size="lg" className="w-full text-lg gap-3 h-14 shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300"
                                style={{
                                    backgroundColor: 'var(--primary)',
                                    color: 'var(--primary-foreground)'
                                }}>
                                <Heart className="h-6 w-6 fill-current" />
                                {t('landing.cta.donate')}
                            </Button>
                        </Link>

                        <Link to={`/${slug}/live`} className="w-full">
                            <Button size="lg" variant="outline" className="w-full text-lg gap-3 h-14 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                                style={{
                                    borderColor: 'hsl(var(--landing-card-glass-border) / 0.5)',
                                    backgroundColor: 'hsl(var(--landing-card-glass-bg) / 0.1)',
                                    color: 'var(--foreground)'
                                }}>
                                <Tv className="h-6 w-6" />
                                {t('landing.cta.live')}
                            </Button>
                        </Link>
                    </div>

                    {/* Stats / Info Cards */}
                    <div className={`grid grid-cols-1 ${[config.content.landing?.impact?.enabled !== false,
                        config.content.landing?.community?.enabled !== false,
                        config.content.landing?.interactive?.enabled !== false].filter(Boolean).length === 2
                            ? 'sm:grid-cols-2'
                            : [config.content.landing?.impact?.enabled !== false,
                            config.content.landing?.community?.enabled !== false,
                            config.content.landing?.interactive?.enabled !== false].filter(Boolean).length === 1
                                ? 'sm:grid-cols-1 max-w-sm mx-auto'
                                : 'sm:grid-cols-3'
                        } gap-6 w-full text-left mt-16`}>
                        {config.content.landing?.impact?.enabled !== false && (
                            <FeatureCard
                                icon={<Heart className="h-6 w-6" style={{ color: 'hsl(var(--landing-feature-icon-primary))' }} />}
                                title={t('landing.features.impact.title')}
                                description={t('landing.features.impact.description')}
                                url={config.content.landing?.impact?.url}
                            />
                        )}
                        {config.content.landing?.community?.enabled !== false && (
                            <FeatureCard
                                icon={<Globe className="h-6 w-6" style={{ color: 'hsl(var(--landing-feature-icon-secondary))' }} />}
                                title={t('landing.features.community.title')}
                                description={t('landing.features.community.description')}
                                url={config.content.landing?.community?.url}
                            />
                        )}
                        {config.content.landing?.interactive?.enabled !== false && (
                            <FeatureCard
                                icon={<Tv className="h-6 w-6" style={{ color: 'hsl(var(--landing-feature-icon-tertiary))' }} />}
                                title={t('landing.features.interactive.title')}
                                description={t('landing.features.interactive.description')}
                                url={config.content.landing?.interactive?.url}
                            />
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};



export default LandingPage;
