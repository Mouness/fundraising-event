import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/providers/AppConfigProvider';
import { LandingBackground } from '@/features/public/components/LandingBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Heart, Tv, UserCog } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const LandingPage = () => {
    const { config } = useAppConfig();
    const { t } = useTranslation('common');
    const { slug } = useParams<{ slug: string }>();

    const formattedGoal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(config.content.goalAmount);

    return (
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-background text-foreground overflow-hidden relative">
            {/* Animated Background Mesh */}
            <LandingBackground />

            {/* Header */}
            <header className="border-b sticky top-0 z-50 backdrop-blur-md"
                style={{ backgroundColor: 'hsl(var(--landing-card-glass-bg) / 0.8)', borderColor: 'hsl(var(--landing-card-glass-border) / var(--landing-card-glass-border-alpha))' }}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={`/${slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {config.theme?.assets?.logo ? (
                                <img
                                    src={config.theme.assets.logo}
                                    alt={config.content.title}
                                    className="h-10 w-auto object-contain"
                                    style={{ borderColor: 'transparent' }}
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground" style={{ backgroundColor: 'var(--primary)' }}>
                                    <Heart className="h-6 w-6 fill-current" />
                                </div>
                            )}
                            <h1 className="text-xl font-bold hidden sm:block tracking-tight" style={{ color: 'var(--foreground)' }}>
                                {config.content.title}
                            </h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Link to={slug ? `/${slug}/staff` : '/login'}>
                            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                                <UserCog className="h-4 w-4" />
                                <span>{t('landing.footer.staff')}</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">

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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left mt-16">
                        <FeatureCard
                            icon={<Heart className="h-6 w-6" style={{ color: 'hsl(var(--landing-feature-icon-primary))' }} />}
                            title={t('landing.features.impact.title')}
                            description={t('landing.features.impact.description')}
                            url={config.content.landing?.impact?.url}
                        />
                        <FeatureCard
                            icon={<Globe className="h-6 w-6" style={{ color: 'hsl(var(--landing-feature-icon-secondary))' }} />}
                            title={t('landing.features.community.title')}
                            description={t('landing.features.community.description')}
                            url={config.content.landing?.community?.url}
                        />
                        <FeatureCard
                            icon={<Tv className="h-6 w-6" style={{ color: 'hsl(var(--landing-feature-icon-tertiary))' }} />}
                            title={t('landing.features.interactive.title')}
                            description={t('landing.features.interactive.description')}
                            url={config.content.landing?.interactive?.url}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t mt-auto text-sm backdrop-blur-md relative z-10"
                style={{ backgroundColor: 'hsl(var(--landing-card-glass-bg) / 0.5)', color: 'hsl(var(--landing-footer-text))', borderColor: 'hsl(var(--landing-card-glass-border) / var(--landing-card-glass-border-alpha))' }}>
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 opacity-80">
                    <p>
                        © {new Date().getFullYear()} <span className="font-medium">{config.communication?.legalName}</span>. {t('landing.footer.rights')}
                    </p>
                    <div className="flex items-center gap-6">
                        {config.communication?.website && (
                            <a href={config.communication.website} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                                {t('landing.footer.website')}
                            </a>
                        )}
                        {config.communication?.supportEmail && (
                            <a href={`mailto:${config.communication.supportEmail}`} className="hover:text-primary transition-colors">
                                {t('landing.footer.support')}
                            </a>
                        )}
                        <Link to={slug ? `/${slug}/staff` : '/login'} className="sm:hidden hover:text-primary transition-colors">
                            {t('landing.footer.staff')}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, url }: { icon: React.ReactNode, title: string, description: string, url?: string }) => {
    const CardContentElement = (
        <Card className="backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-lg border-0 h-full cursor-pointer"
            style={{
                backgroundColor: 'hsl(var(--landing-card-glass-bg) / var(--landing-card-glass-alpha))',
                color: 'var(--card-foreground)',
                boxShadow: 'var(--card-hover-shadow)'
            }}>
            <CardContent className="p-6 flex flex-col gap-3">
                <div className="p-3 rounded-xl w-fit" style={{ backgroundColor: 'hsl(var(--landing-card-glass-bg) / 0.1)', border: '1px solid hsl(var(--landing-card-glass-border) / 0.2)' }}>
                    {icon}
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{description}</p>
            </CardContent>
        </Card>
    );

    if (url) {
        if (url.startsWith('http')) {
            return <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">{CardContentElement}</a>;
        }
        return <Link to={url} className="block h-full">{CardContentElement}</Link>;
    }

    return <div className="h-full">{CardContentElement}</div>;
};

export default LandingPage;
