import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect if unauthorized (except for login pages)
            // We'll handle redirection in the Router or via event/callback to avoid circular dependencies
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                // window.location.href = '/login'; // Optional: Auto-redirect
            }
        }
        return Promise.reject(error);
    }
);
