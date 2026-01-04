import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { render as rtlRender, type RenderOptions } from '@testing-library/react';

export * from '@testing-library/react';

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

export const TestWrapper = ({ children }: { children: ReactNode }) => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                {children}
            </MemoryRouter>
        </QueryClientProvider>
    );
};

const customRender = (ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) =>
    rtlRender(ui, { wrapper: TestWrapper, ...options });

export { customRender as render };

