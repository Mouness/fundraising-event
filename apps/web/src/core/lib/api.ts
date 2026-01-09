import axios from 'axios';
import { STORAGE_KEYS } from './constants';

export const VITE_API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const staffToken = localStorage.getItem(STORAGE_KEYS.STAFF_TOKEN);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else if (staffToken) {
        config.headers.Authorization = `Bearer ${staffToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isStaffPath = window.location.pathname.includes('/staff') && !window.location.pathname.startsWith('/admin');

            if (isStaffPath) {
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem(STORAGE_KEYS.STAFF_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.STAFF_USER);
                    // Find slug in path - assuming /:slug/staff/...
                    const match = window.location.pathname.match(/\/([^\/]+)\/staff/);
                    if (match) {
                        window.location.href = `/${match[1]}/staff/login`;
                    } else {
                        window.location.href = '/';
                    }
                }
            } else {
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem(STORAGE_KEYS.TOKEN);
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const getApiErrorMessage = (error: unknown, defaultMessage = 'Request failed'): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return defaultMessage;
};
