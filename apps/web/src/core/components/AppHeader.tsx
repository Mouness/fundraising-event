import { useAppConfig } from '@core/providers/AppConfigProvider';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { STORAGE_KEYS } from '@core/lib/constants';

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
        const isStaff = !!localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.STAFF_USER);

        if (isStaff) {
            navigate(slug ? `/${slug}` : '/');
        } else {
            navigate('/login');
        }
    };

    const getUser = () => {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem(STORAGE_KEYS.STAFF_USER);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const user = getUser();
    const isLoggedIn = !!(localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN));

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

    return (
        <header
            className="border-b px-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200"
            style={{
                height: 'var(--header-height)',
                backgroundColor: 'var(--header-bg)',
                borderColor: 'var(--header-border)'
            }}
        >
            {slug ? (
                <Link to={`/${slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label={t('app_header.home')}>
                    {headerContent}
                </Link>
            ) : (
                <div className="flex items-center gap-3">
                    {headerContent}
                </div>
            )}

            <div className="flex items-center gap-2">
                <LanguageSwitcher />

                {showOnlineStatus && (
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-2 w-2 rounded-full animate-pulse ${isOnline
                                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                }`}
                        />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
                            {isOnline ? t('app_header.online') : t('app_header.offline')}
                        </span>
                    </div>
                )}

                {rightContent}

                {!rightContent && isLoggedIn && (
                    <div className="flex items-center gap-3 ml-2 pl-2 border-l border-muted/20">
                        {user && (
                            <span className="text-sm font-medium hidden md:inline opacity-80" style={{ color: 'var(--header-text)' }}>
                                {user.name || user.email}
                            </span>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="hover:bg-black/5"
                            style={{ color: 'var(--header-text)' }}
                            aria-label={t('common.logout', 'Log off')}
                            title={t('common.logout', 'Log off')}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
};
