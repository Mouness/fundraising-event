import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@core/providers/AppConfigProvider';
import { Button } from '@core/components/ui/button';
import { Heart, UserCog } from 'lucide-react';
import { LanguageSwitcher } from '@core/components/LanguageSwitcher';

export const PublicHeader = () => {
    const { config } = useAppConfig();
    const { t } = useTranslation('common');
    const { slug } = useParams<{ slug: string }>();

    const homeLink = slug ? `/${slug}` : '/';
    const staffLink = slug ? `/${slug}/staff` : '/login';

    return (
        <header className="border-b sticky top-0 z-50 backdrop-blur-md transition-colors duration-300"
            style={{
                backgroundColor: 'hsl(var(--landing-card-glass-bg) / 0.8)',
                borderColor: 'hsl(var(--landing-card-glass-border) / var(--landing-card-glass-border-alpha))'
            }}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to={homeLink} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
                    <Link to={staffLink}>
                        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                            <UserCog className="h-4 w-4" />
                            <span>{t('landing.footer.staff')}</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};
