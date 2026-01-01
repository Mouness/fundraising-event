import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResult {
    success: boolean;
    error?: string;
}

/**
 * Handles the administrative login flow using the backend auth module.
 * Manages token storage and navigation on successful authentication.
 */
export const useLogin = () => {
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const res = await api.post('/auth/login', credentials);
            return res.data;
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/admin');
        },
        onError: (err) => {
            console.error(err);
        }
    });

    const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
        try {
            await mutation.mutateAsync(credentials);
            return { success: true };
        } catch (err) {
            let errorMessage = 'Login failed';
            if (isAxiosError(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            return { success: false, error: errorMessage };
        }
    };

    return {
        login,
        error: mutation.error instanceof Error ? mutation.error.message : null,
        isLoading: mutation.isPending
    };
};
