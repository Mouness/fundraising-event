import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../features/admin/layouts/AdminLayout';
import { DashboardPage } from '../features/admin/pages/DashboardPage';
import { LoginPage } from '../features/auth/pages/LoginPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/admin" replace />, // Redirect root to admin for now
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/admin',
        element: <AdminLayout />,
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
    // Public Routes (Donation, Live) to be added
    {
        path: '*',
        element: <div>404 Not Found</div>
    }
]);
