import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AuthSuccessPage = () => {
    const { t } = useTranslation('common');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');

        if (token) {
            localStorage.setItem('token', token);
            if (userJson) {
                try {
                    // Decode safely before storing if needed, or just store raw if apps expects raw
                    // The backend sent encoded URI component, searchParams decodes it automatically
                    localStorage.setItem('user', userJson);
                } catch (e) {
                    console.error('Failed to parse user data', e);
                }
            }
            navigate('/');
        } else {
            console.error('No token found in URL');
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">{t('login.logging_in')}</div>
        </div>
    );
};
