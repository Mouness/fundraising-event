import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const AuthGuard = () => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        // Redirect to login page while saving the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
