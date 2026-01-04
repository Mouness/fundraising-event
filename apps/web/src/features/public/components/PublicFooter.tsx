import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '@/providers/AppConfigProvider';

export const PublicFooter = () => {
    const { config } = useAppConfig();
    const { t } = useTranslation('common');
    const { slug } = useParams<{ slug: string }>();

    return (
        <footer className="py-8 border-t mt-auto text-sm backdrop-blur-md relative z-10 transition-colors duration-300"
            style={{
                backgroundColor: 'hsl(var(--landing-card-glass-bg) / 0.5)',
                color: 'hsl(var(--landing-footer-text))',
                borderColor: 'hsl(var(--landing-card-glass-border) / var(--landing-card-glass-border-alpha))'
            }}>
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 opacity-80">
                <p>
                    © {new Date().getFullYear()} <span className="font-medium">{config.communication?.legalName || 'Fundraising Platform'}</span>. {t('landing.footer.rights')}
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
    );
};
