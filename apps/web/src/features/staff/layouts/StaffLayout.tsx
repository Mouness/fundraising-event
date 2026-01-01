import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useStaffAuth } from "../hooks/useStaffAuth";

export const StaffLayout = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { getStaffUser, logout } = useStaffAuth();
    const staffUser = getStaffUser();

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
                rightContent={
                    <div className="flex items-center gap-4">
                        {staffUser && (
                            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
                                <User className="w-4 h-4" />
                                <span>{staffUser.name}</span>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={logout}
                            className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                }
            />
            <main>
                <Outlet />
            </main>
        </div>
    );
};
