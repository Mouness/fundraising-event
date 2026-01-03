import { Suspense, lazy, type ComponentType } from 'react';
import { createBrowserRouter, Navigate, Outlet, useParams } from 'react-router-dom';
import { PageLoader } from '@/components/ui/page-loader';
import { AppConfigProvider } from '@/providers/AppConfigProvider';
import { EventProvider } from '@/features/events/context/EventContext';
import { StaffGuard } from '../features/staff/components/StaffGuard';
import { AuthGuard } from '../features/auth/components/AuthGuard';

// Helper for lazy loading
const Loadable = (Component: ComponentType, fallback = <PageLoader />) => (
    <Suspense fallback={fallback}>
        <Component />
    </Suspense>
);

// Lazy load pages
const AdminLayout = lazy(() => import('../features/admin/layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));
const DashboardPage = lazy(() => import('../features/admin/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const DonationsPage = lazy(() => import('../features/events/pages/DonationsPage').then(module => ({ default: module.DonationsPage })));
const EventSettingsPage = lazy(() => import('../features/events/pages/EventSettingsPage').then(module => ({ default: module.EventSettingsPage })));
const GlobalSettingsPage = lazy(() => import('../features/admin/pages/GlobalSettingsPage').then(module => ({ default: module.GlobalSettingsPage })));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const LivePage = lazy(() => import('../features/live/pages/LivePage').then(module => ({ default: module.LivePage })));
const DonationPage = lazy(() => import('../features/donation/pages/DonationPage').then(module => ({ default: module.DonationPage })));
const ThankYouPage = lazy(() => import('../features/donation/pages/ThankYouPage').then(module => ({ default: module.ThankYouPage })));
const StaffLayout = lazy(() => import('../features/staff/layouts/StaffLayout').then(module => ({ default: module.StaffLayout })));
const CollectorPage = lazy(() => import('../features/staff/pages/CollectorPage').then(module => ({ default: module.CollectorPage })));
const StaffLoginPage = lazy(() => import('../features/staff/pages/StaffLoginPage').then(module => ({ default: module.StaffLoginPage })));
const EventListPage = lazy(() => import('../features/events/pages/EventListPage').then(module => ({ default: module.EventListPage })));
const CreateEventPage = lazy(() => import('../features/events/pages/CreateEventPage').then(module => ({ default: module.CreateEventPage })));
const EventLayout = lazy(() => import('../features/events/layouts/EventLayout').then(module => ({ default: module.EventLayout })));
const EventDashboardPage = lazy(() => import('../features/events/pages/EventDashboardPage').then(module => ({ default: module.EventDashboardPage })));
const LandingPage = lazy(() => import('../features/public/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const RootLandingPage = lazy(() => import('../features/public/pages/RootLandingPage').then(module => ({ default: module.RootLandingPage })));
const EventTeamPage = lazy(() => import('../features/events/pages/EventTeamPage').then(module => ({ default: module.EventTeamPage })));
const StaffManagementPage = lazy(() => import('../features/admin/pages/StaffManagementPage').then(module => ({ default: module.StaffManagementPage })));

// Wrapper to provide event context based on URL slug
const EventContextWrapper = () => {
    const { slug } = useParams<{ slug: string }>();
    return (
        <AppConfigProvider slug={slug}>
            <EventProvider>
                <Outlet />
            </EventProvider>
        </AppConfigProvider>
    );
};

const EventAdminWrapper = () => {
    const { slug } = useParams<{ slug: string }>();
    return (
        <AppConfigProvider slug={slug}>
            <Outlet />
        </AppConfigProvider>
    );
};

const GlobalAdminWrapper = () => {
    return (
        <AppConfigProvider>
            <Outlet />
        </AppConfigProvider>
    );
};

export const router = createBrowserRouter([
    // Generic Root Landing Page (Platform Portal)
    {
        path: '/',
        element: (
            <AppConfigProvider>
                {Loadable(RootLandingPage)}
            </AppConfigProvider>
        )
    },
    // Event specific routes under /:slug
    {
        path: '/:slug',
        element: <EventContextWrapper />,
        children: [
            {
                index: true,
                element: Loadable(LandingPage),
            },
            {
                path: 'donate',
                element: Loadable(DonationPage),
            },
            {
                path: 'thank-you',
                element: Loadable(ThankYouPage),
            },
            {
                path: 'live',
                element: Loadable(LivePage),
            },
            {
                path: 'staff',
                element: Loadable(StaffLayout),
                children: [
                    {
                        path: 'login',
                        element: Loadable(StaffLoginPage),
                    },
                    {
                        element: <StaffGuard />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="collect" replace />
                            },
                            {
                                path: 'collect',
                                element: Loadable(CollectorPage),
                            }
                        ]
                    }
                ]
            }
        ]
    },
    // Global / Admin routes (no slug context needed or handled differently)
    {
        path: '/login',
        element: (
            <AppConfigProvider>
                {Loadable(LoginPage)}
            </AppConfigProvider>
        ),
    },
    {
        path: '/admin',
        element: <GlobalAdminWrapper />,
        children: [
            {
                element: <AuthGuard />,
                children: [
                    {
                        element: Loadable(AdminLayout),
                        children: [
                            {
                                path: '',
                                element: Loadable(DashboardPage),
                            },
                            {
                                path: 'events/new',
                                element: Loadable(CreateEventPage)
                            },
                            {
                                path: 'events',
                                element: Loadable(EventListPage)
                            },
                            {
                                path: 'staff',
                                element: Loadable(StaffManagementPage)
                            },
                            {
                                path: 'settings',
                                element: Loadable(GlobalSettingsPage)
                            }
                        ]
                    },
                    // Event specific admin routes (Separate Layout)
                    {
                        path: 'events/:slug',
                        element: <EventAdminWrapper />,
                        children: [
                            {
                                element: Loadable(EventLayout),
                                children: [
                                    {
                                        index: true,
                                        element: Loadable(EventDashboardPage),
                                    },
                                    {
                                        path: 'donations',
                                        element: Loadable(DonationsPage),
                                    },
                                    {
                                        path: 'settings',
                                        element: Loadable(EventSettingsPage),
                                    },
                                    {
                                        path: 'team',
                                        element: Loadable(EventTeamPage),
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        path: '*',
        element: (
            <AppConfigProvider>
                <div>404 Not Found</div>
            </AppConfigProvider>
        )
    }
]);
