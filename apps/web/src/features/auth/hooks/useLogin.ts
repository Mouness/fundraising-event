import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function useLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', credentials);
            localStorage.setItem('token', res.data.accessToken);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            navigate('/admin');
            return { success: true };
        } catch (err) {
            console.error(err);
            let errorMessage = 'Login failed';

            if (isAxiosError(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        error,
        isLoading
    };
}
