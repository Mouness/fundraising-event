import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const staffToken = localStorage.getItem('staff_token');

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
            const isStaffPath = window.location.pathname.includes('/staff');

            if (isStaffPath) {
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('staff_token');
                    localStorage.removeItem('staff_user');
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
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);
