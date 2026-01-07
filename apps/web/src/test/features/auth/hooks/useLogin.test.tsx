import { renderHook, act, waitFor } from '@testing-library/react';
import { useLogin } from '@features/auth/hooks/useLogin';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@core/lib/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@core/lib/api', () => ({
    api: {
        post: vi.fn(),
    },
    VITE_API_URL: '/api',
    getApiErrorMessage: (_err: any, fallback: string) => fallback,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient} > {children} </QueryClientProvider>
);

describe('useLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.setItem = vi.fn();
        queryClient.clear();
    });

    it('should login successfully', async () => {
        (api.post as any).mockResolvedValue({
            data: { accessToken: 'token', user: { id: 1 } },
        });

        const { result } = renderHook(() => useLogin(), { wrapper });

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login({ email: 'test@example.com', password: 'password' });
        });

        expect(loginResult).toEqual({ success: true });
        expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password' });
        expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'token');
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    it('should handle login failure', async () => {
        const error = new Error('Bad credentials');
        (error as any).isAxiosError = true;
        (error as any).response = { data: { message: 'Bad credentials' } };
        (api.post as any).mockRejectedValue(error);

        const { result } = renderHook(() => useLogin(), { wrapper });

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login({ email: 'test@example.com', password: 'wrong' });
        });

        expect(loginResult).toEqual({ success: false, error: 'Login failed' });
        await waitFor(() => expect(result.current.error).toBe('Login failed'));
    });
});
