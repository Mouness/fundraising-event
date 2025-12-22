import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

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
        <div className="min-h-screen bg-slate-50/50 dark:bg-black text-slate-900 dark:text-slate-50">
            {/* Minimal Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200">
                <div className="font-bold text-lg tracking-tight dark:text-white">
                    Staff<span className="text-[var(--primary)]">Collector</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'} animate-pulse`} />
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
};
