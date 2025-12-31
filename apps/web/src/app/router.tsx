import { Suspense, lazy, type ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/PageLoader';

// Helper for lazy loading
const Loadable = (Component: ComponentType, fallback = <PageLoader />) => (
    <Suspense fallback={fallback}>
        <Component />
    </Suspense>
);

// Lazy load pages
const AdminLayout = lazy(() => import('../features/admin/layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));
const DashboardPage = lazy(() => import('../features/admin/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const EventSettingsPage = lazy(() => import('../features/events/pages/EventSettingsPage').then(module => ({ default: module.EventSettingsPage })));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const LivePage = lazy(() => import('../features/live/pages/LivePage').then(module => ({ default: module.LivePage })));
const DonationPage = lazy(() => import('../features/donation/pages/DonationPage').then(module => ({ default: module.DonationPage })));
const ThankYouPage = lazy(() => import('../features/donation/pages/ThankYouPage').then(module => ({ default: module.ThankYouPage })));
const StaffLayout = lazy(() => import('../features/staff/layouts/StaffLayout').then(module => ({ default: module.StaffLayout })));
const CollectorPage = lazy(() => import('../features/staff/pages/CollectorPage').then(module => ({ default: module.CollectorPage })));
const EventListPage = lazy(() => import('../features/events/pages/EventListPage').then(module => ({ default: module.EventListPage })));
const EventLayout = lazy(() => import('../features/events/layouts/EventLayout').then(module => ({ default: module.EventLayout })));
const EventDashboardPage = lazy(() => import('../features/events/pages/EventDashboardPage').then(module => ({ default: module.EventDashboardPage })));

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/donate" replace />,
    },
    {
        path: '/donate',
        element: Loadable(DonationPage),
    },
    {
        path: '/thank-you',
        element: Loadable(ThankYouPage),
    },
    {
        path: '/live',
        element: Loadable(LivePage),
    },
    {
        path: '/live/:slug',
        element: Loadable(LivePage, <div className="bg-black min-h-screen text-white p-4">Loading Live Screen...</div>),
    },
    {
        path: '/login',
        element: Loadable(LoginPage),
    },
    {
        path: '/admin',
        element: Loadable(AdminLayout),
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: 'events',
                element: Loadable(EventListPage)
            },
            {
                path: 'events/:slug',
                element: Loadable(EventLayout),
                children: [
                    {
                        index: true,
                        element: Loadable(EventDashboardPage),
                    },
                    {
                        path: 'settings',
                        element: <EventSettingsPage />,
                    },
                    {
                        path: 'donations',
                        element: <div>Donations List (Todo)</div>
                    }
                ]
            }
        ],
    },
    {
        path: '/staff',
        element: Loadable(StaffLayout),
        children: [
            {
                path: 'collect',
                element: Loadable(CollectorPage),
            }
        ]
    },
    {
        path: '*',
        element: <div>404 Not Found</div>
    }
]);
