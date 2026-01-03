import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";

export const StaffLayout = () => {
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
            className="min-h-screen text-slate-900 dark:text-slate-50"
            style={{ backgroundColor: 'var(--staff-page-bg)' }}
        >
            <AppHeader
                title="Staff Collector"
                showOnlineStatus={true}
                isOnline={isOnline}
            />
            <main>
                <Outlet />
            </main>
        </div>
    );
};
