import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Lazy load pages
const AdminLayout = lazy(() => import('../features/admin/layouts/AdminLayout').then(module => ({ default: module.AdminLayout })));
const DashboardPage = lazy(() => import('../features/admin/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(module => ({ default: module.LoginPage })));
const LivePage = lazy(() => import('../features/live/pages/LivePage').then(module => ({ default: module.LivePage })));
const DonationPage = lazy(() => import('../features/donation/pages/DonationPage').then(module => ({ default: module.DonationPage })));

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/donate" replace />,
    },
    {
        path: '/donate',
        element: (
            <Suspense fallback={<PageLoader />}>
                <DonationPage />
            </Suspense>
        ),
    },
    {
        path: '/live', // New /live route
        element: (
            <Suspense fallback={<PageLoader />}>
                <LivePage />
            </Suspense>
        ),
    },
    {
        path: '/live/:slug',
        element: (
            <Suspense fallback={<div className="bg-black min-h-screen text-white p-4">Loading Live Screen...</div>}>
                <LivePage />
            </Suspense>
        ),
    },
    {
        path: '/login',
        element: (
            <Suspense fallback={<PageLoader />}>
                <LoginPage />
            </Suspense>
        ),
    },
    {
        path: '/admin',
        element: (
            <Suspense fallback={<PageLoader />}>
                <AdminLayout />
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: 'events',
                element: <div>Events List Placeholder</div>
            }
        ],
    },
    {
        path: '*',
        element: <div>404 Not Found</div>
    }
]);
