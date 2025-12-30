import { renderHook, act } from '@testing-library/react';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/api');
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

describe('useLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset localStorage mock implementation simplified
        window.localStorage.setItem = vi.fn();
    });

    it('should login successfully', async () => {
        (api.post as any).mockResolvedValue({
            data: { accessToken: 'token', user: { id: 1 } },
        });

        const { result } = renderHook(() => useLogin());

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
        const error = { isAxiosError: true, response: { data: { message: 'Bad credentials' } } };
        (api.post as any).mockRejectedValue(error);

        const { result } = renderHook(() => useLogin());

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login({ email: 'test@example.com', password: 'wrong' });
        });

        expect(loginResult).toEqual({ success: false, error: 'Bad credentials' });
        expect(result.current.error).toBe('Bad credentials');
    });
});
