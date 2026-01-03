import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import type { PropsWithChildren } from 'react';
import { AppConfigProvider } from '@/providers/AppConfigProvider';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export const AppProviders = ({ children }: PropsWithChildren) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AppConfigProvider>
                {children}
                <Toaster richColors position="top-center" closeButton />
            </AppConfigProvider>
        </QueryClientProvider>
    );
}
