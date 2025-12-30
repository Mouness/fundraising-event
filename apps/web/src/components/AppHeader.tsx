import { useEventConfig } from '@/features/event/hooks/useEventConfig';

interface AppHeaderProps {
    title?: string;
    showOnlineStatus?: boolean;
    isOnline?: boolean;
    rightContent?: React.ReactNode;
}

export const AppHeader = ({
    title,
    showOnlineStatus = false,
    isOnline = true,
    rightContent
}: AppHeaderProps) => {
    const { config } = useEventConfig();

    return (
        <header
            className="border-b px-4 flex items-center justify-between sticky top-0 z-10 transition-colors duration-200"
            style={{
                height: 'var(--header-height)',
                backgroundColor: 'var(--header-bg)',
                borderColor: 'var(--header-border)'
            }}
        >
            <div className="flex items-center gap-3">
                {config.theme?.assets?.logo && (
                    <img
                        src={config.theme.assets.logo}
                        alt="Logo"
                        className="h-8 w-auto object-contain"
                    />
                )}
                <div>
                    <div
                        className="font-bold text-lg tracking-tight"
                        style={{ color: 'var(--header-text)' }}
                    >
                        {config.content?.title || 'Fundraising Event'}
                        {title && (
                            <span style={{ color: 'var(--header-accent)' }}> · {title}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {showOnlineStatus && (
                    <>
                        <div
                            className={`h-2 w-2 rounded-full animate-pulse ${isOnline
                                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                    : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                }`}
                        />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </>
                )}
                {rightContent}
            </div>
        </header>
    );
};
