import { Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';
import { EventProvider, useEvent } from '@/features/events/context/EventContext';
import { LayoutDashboard, Settings, DollarSign, ArrowLeft, ExternalLink } from 'lucide-react';

const EventSidebar = () => {
    const { event } = useEvent();
    const location = useLocation();

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
                <Link to="/admin/events" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Events
                </Link>
                <div className="px-2">
                    <h1 className="text-lg font-bold truncate" title={event.name}>{event.name}</h1>
                    <p className="text-xs text-muted-foreground truncate">Event Console</p>
                </div>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
                <Link
                    to={baseUrl}
                    className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive(baseUrl) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'
                        }`}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Link>
                <Link
                    to={`${baseUrl}/donations`}
                    className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive(`${baseUrl}/donations`) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'
                        }`}
                >
                    <DollarSign className="h-4 w-4" />
                    Donations
                </Link>
                <Link
                    to={`${baseUrl}/settings`}
                    className={`p-2 rounded flex items-center gap-3 transition-colors ${isActive(`${baseUrl}/settings`) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/10'
                        }`}
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>

                <div className="mt-8 pt-4 border-t border-dashed border-gray-700">
                    <a
                        href={`/live/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
        </EventProvider>
    );
};
