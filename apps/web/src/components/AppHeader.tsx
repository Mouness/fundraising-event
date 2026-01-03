import { useAppConfig } from '@/providers/AppConfigProvider';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

interface AppHeaderProps {
    title?: string;
    showOnlineStatus?: boolean;
    isOnline?: boolean;
    rightContent?: React.ReactNode;
}

export const AppHeader = ({
    title,
    showOnlineStatus = false,
    isOnline = true,
    rightContent
}: AppHeaderProps) => {
    const { config } = useAppConfig();
    const { t } = useTranslation('common');
    const params = useParams();
    const navigate = useNavigate();
    const slug = params?.slug;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_user');
        navigate('/login');
    };

    const user = (() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        const staffUserStr = localStorage.getItem('staff_user');
        if (staffUserStr) {
            try {
                return JSON.parse(staffUserStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    })();

    return (
        <header
            className="border-b px-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200"
            style={{
                height: 'var(--header-height)',
                backgroundColor: 'var(--header-bg)',
                borderColor: 'var(--header-border)'
            }}
        >
            {(() => {
                const headerContent = (
                    <>
                        {config.theme?.assets?.logo && (
                            <img
                                src={config.theme.assets.logo}
                                alt="Logo"
                                className="h-8 w-auto object-contain"
                            />
                        )}
                        <div>
                            <div
                                className="font-bold text-lg tracking-tight"
                                style={{ color: 'var(--header-text)' }}
                            >
                                {config.content?.title || t('app_header.title')}
                                {title && (
                                    <span style={{ color: 'var(--header-accent)' }}> · {title}</span>
                                )}
                            </div>
                        </div>
                    </>
                );

                return slug ? (
                    <Link to={`/${slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        {headerContent}
                    </Link>
                ) : (
                    <div className="flex items-center gap-3">
                        {headerContent}
                    </div>
                );
            })()}

            <div className="flex items-center gap-2">
                <LanguageSwitcher />

                {showOnlineStatus && (
                    <>
                        <div
                            className={`h-2 w-2 rounded-full animate-pulse ${isOnline
                                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                }`}
                        />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
                            {isOnline ? t('app_header.online') : t('app_header.offline')}
                        </span>
                    </>
                )}
                {rightContent}

                {(localStorage.getItem('token') || localStorage.getItem('staff_token')) && (
                    <div className="flex items-center gap-3 ml-2 pl-2 border-l border-muted/20">
                        {user && (
                            <span className="text-sm font-medium hidden lg:inline opacity-80" style={{ color: 'var(--header-text)' }}>
                                {user.name || user.email}
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2 hover:bg-black/5"
                            style={{ color: 'var(--header-text)' }}
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="font-medium">{t('common.logout', 'Log off')}</span>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
};
