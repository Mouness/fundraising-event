import { Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PageLoader } from '@core/components/ui/page-loader';
import { AppHeader } from '@core/components/AppHeader';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Layers, Users, Settings } from 'lucide-react';

export const AdminLayout = () => {
    const { t } = useTranslation('common');
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <AppHeader title={t('admin_layout.title', 'Admin')} />
            <div className="flex flex-1 overflow-hidden">
                <aside
                    className="p-4 border-r flex flex-col"
                    style={{
                        width: 'var(--admin-sidebar-width)',
                        backgroundColor: 'var(--admin-sidebar-bg)',
                        color: 'var(--admin-sidebar-text)',
                        padding: 'var(--admin-sidebar-padding)'
                    }}
                >
                    <nav className="flex flex-col gap-1">
                        <Link
                            to="/admin"
                            className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive('/admin') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/10'
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            {t('nav.dashboard')}
                        </Link>
                        <Link
                            to="/admin/events"
                            className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive('/admin/events') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/10'
                                }`}
                        >
                            <Layers className="h-4 w-4" />
                            {t('nav.events')}
                        </Link>
                        <Link
                            to="/admin/staff"
                            className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive('/admin/staff') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/10'
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            {t('nav.staff', 'Staff')}
                        </Link>
                        <Link
                            to="/admin/settings"
                            className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive('/admin/settings') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/10'
                                }`}
                        >
                            <Settings className="h-4 w-4" />
                            {t('nav.settings')}
                        </Link>
                    </nav>
                </aside>
                <main
                    className="flex-1 overflow-auto"
                    style={{
                        backgroundColor: 'var(--admin-content-bg)'
                    }}
                >
                    <div
                        className="p-6"
                        style={{ padding: 'var(--admin-content-padding)' }}
                    >
                        <Suspense fallback={<PageLoader />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}
