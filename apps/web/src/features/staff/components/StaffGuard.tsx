import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';

export const StaffGuard = () => {
    const { isStaffAuthenticated } = useStaffAuth();
    const { slug } = useParams<{ slug: string }>();

    if (!isStaffAuthenticated()) {
        return <Navigate to={`/${slug}/staff/login`} replace />;
    }

    return <Outlet />;
};
