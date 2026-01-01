import { Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';
import { EventProvider, useEvent } from '@/features/events/context/EventContext';
import { LayoutDashboard, Settings, DollarSign, ArrowLeft, ExternalLink, Users } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { useTranslation } from 'react-i18next';

const EventSidebar = () => {
    const { event } = useEvent();
    const location = useLocation();
    const { t } = useTranslation('common');

    if (!event) return null;

    const isActive = (path: string) => location.pathname === path || location.pathname.endsWith(path);
    const baseUrl = `/admin/events/${event.slug}`;

    return (
        <aside
            className="p-4 flex flex-col h-full border-r"
            style={{
                width: 'var(--admin-sidebar-width)',
                backgroundColor: 'var(--admin-sidebar-bg)',
                color: 'var(--admin-sidebar-text)',
                padding: 'var(--admin-sidebar-padding)'
            }}
        >
            <div className="mb-6">
                <Link to="/admin/events" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--admin-sidebar-text)] mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> {t('admin_events.back_to_events', 'Back to Events')}
                </Link>
                <div className="px-2">
                    <h1 className="text-lg font-bold truncate" title={event.name}>{event.name}</h1>
                    <p className="text-xs text-muted-foreground truncate">{t('admin_events.event_console', 'Event Console')}</p>
                </div>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
                <Link
                    to={baseUrl}
                    className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive(baseUrl) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'
                        }`}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    {t('admin_events.dashboard.title', 'Dashboard')}
                </Link>
                <Link
                    to={`${baseUrl}/donations`}
                    className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive(`${baseUrl}/donations`) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'
                        }`}
                >
                    <DollarSign className="h-4 w-4" />
                    {t('admin_events.donations', 'Donations')}
                </Link>
                <Link
                    to={`${baseUrl}/settings`}
                    className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive(`${baseUrl}/settings`) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'
                        }`}
                >
                    <Settings className="h-4 w-4" />
                    {t('admin_events.settings', 'Settings')}
                </Link>
                <Link
                    to={`${baseUrl}/team`}
                    className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive(`${baseUrl}/team`) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'
                        }`}
                >
                    <Users className="h-4 w-4" />
                    {t('admin_events.team', 'Team')}
                </Link>

                <div className="mt-8 pt-4 border-t border-dashed border-gray-700">
                    <a
                        href={`/${event.slug}/live`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded flex items-center gap-3 text-sm text-muted-foreground hover:text-[var(--admin-sidebar-text)] transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open Live Screen
                    </a>
                </div>
            </nav>
        </aside>
    );
};

export const EventLayout = () => {
    return (
        <EventProvider>
            <div className="flex h-screen w-full">
                <EventSidebar />
                <main
                    className="flex-1 flex flex-col min-w-0" // Flex col to stack header and content
                    style={{
                        backgroundColor: 'var(--admin-content-bg)',
                    }}
                >
                    <AppHeader title="Event Management" />
                    <div className="flex-1 overflow-auto" style={{ padding: 'var(--admin-content-padding)' }}>
                        <Suspense fallback={<PageLoader />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </EventProvider>
    );
};
