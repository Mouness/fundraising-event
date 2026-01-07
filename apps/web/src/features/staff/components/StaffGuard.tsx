import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { useEvent } from '@features/events/context/EventContext';

export const StaffGuard = () => {
    const { isStaffAuthenticated } = useStaffAuth();
    const { slug } = useParams<{ slug: string }>();
    const { event, isLoading } = useEvent();

    if (isLoading) return null;

    if (event && !isStaffAuthenticated(event.id)) {
        return <Navigate to={`/${slug}/staff/login`} replace />;
    }

    return <Outlet />;
};
