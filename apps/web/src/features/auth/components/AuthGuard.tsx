import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const AuthGuard = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
            // If user is authenticated but doesn't have the right role, 
            // clear session and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/login" replace />;
        }
    } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
