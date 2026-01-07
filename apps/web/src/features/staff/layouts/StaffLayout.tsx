import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppHeader } from "@core/components/AppHeader";
import { useTranslation } from "react-i18next";

export const StaffLayout = () => {
    const { t } = useTranslation('common');
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: 'var(--staff-page-bg)' }}
        >
            <AppHeader
                title={t('staff.collector_title')}
                showOnlineStatus={true}
                isOnline={isOnline}
            />
            <main>
                <Outlet />
            </main>
        </div>
    );
};
