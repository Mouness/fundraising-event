import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const AuthGuard = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    let isValid = false;
    try {
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) {
            isValid = true;
        }
    } catch {
        // invalid json
    }

    if (!isValid) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
