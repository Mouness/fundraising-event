import { Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';
import { AppHeader } from '@/components/AppHeader';
import { useTranslation } from 'react-i18next';

export const AdminLayout = () => {
    const { t } = useTranslation('common');
    return (
        <div className="flex h-screen w-full">
            <aside
                className="p-4"
                style={{
                    width: 'var(--admin-sidebar-width)',
                    backgroundColor: 'var(--admin-sidebar-bg)',
                    color: 'var(--admin-sidebar-text)',
                    padding: 'var(--admin-sidebar-padding)'
                }}
            >
                <h1 className="text-xl font-bold mb-8">{t('admin.header')}</h1>
                <nav className="flex flex-col gap-2">
                    <Link
                        to="/admin"
                        className="p-2 rounded flex items-center gap-2 transition-colors"
                        style={{ ':hover': { backgroundColor: 'var(--admin-sidebar-hover)' } } as any}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-sidebar-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {t('nav.dashboard')}
                    </Link>
                    <Link
                        to="/admin/events"
                        className="p-2 rounded flex items-center gap-2 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-sidebar-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {t('nav.events')}
                    </Link>
                    <Link
                        to="/admin/staff"
                        className="p-2 rounded flex items-center gap-2 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-sidebar-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {t('nav.staff', 'Staff')}
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="p-2 rounded flex items-center gap-2 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-sidebar-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {t('nav.settings')}
                    </Link>
                </nav>
            </aside>
            <main
                className="flex-1 flex flex-col min-w-0"
                style={{
                    backgroundColor: 'var(--admin-content-bg)'
                }}
            >
                <AppHeader title="Admin" />
                <div
                    className="flex-1 overflow-auto"
                    style={{ padding: 'var(--admin-content-padding)' }}
                >
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
