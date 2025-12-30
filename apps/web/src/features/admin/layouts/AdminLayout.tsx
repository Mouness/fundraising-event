import { Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';

export const AdminLayout = () => {
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
                <h1 className="text-xl font-bold mb-8">Fundraising Admin</h1>
                <nav className="flex flex-col gap-2">
                    <Link
                        to="/admin"
                        className="p-2 rounded flex items-center gap-2 transition-colors"
                        style={{ ':hover': { backgroundColor: 'var(--admin-sidebar-hover)' } } as any}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-sidebar-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/events"
                        className="p-2 rounded flex items-center gap-2 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-sidebar-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Events
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="p-2 rounded flex items-center gap-2 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--admin-sidebar-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Settings
                    </Link>
                </nav>
            </aside>
            <main
                className="flex-1 overflow-auto"
                style={{
                    backgroundColor: 'var(--admin-content-bg)',
                    padding: 'var(--admin-content-padding)'
                }}
            >
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
}
