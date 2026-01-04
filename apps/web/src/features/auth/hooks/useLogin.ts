import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api, getApiErrorMessage } from '@/lib/api';

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
        }
    });

    const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
        try {
            await mutation.mutateAsync(credentials);
            return { success: true };
        } catch (err) {
            return { success: false, error: getApiErrorMessage(err, 'Login failed') };
        }
    };

    return {
        login,
        error: mutation.error ? getApiErrorMessage(mutation.error, 'Login failed') : null,
        isLoading: mutation.isPending
    };
};


