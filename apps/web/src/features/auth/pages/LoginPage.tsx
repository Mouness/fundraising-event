import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useLogin } from '../hooks/useLogin';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const getLoginSchema = (t: any) => z.object({
    email: z.string().email({ message: t('validation.invalid_email') }),
    password: z.string().min(1, { message: t('validation.required') }),
});

type LoginForm = z.infer<ReturnType<typeof getLoginSchema>>;

export const LoginPage = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { login, error, isLoading } = useLogin();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role === 'ADMIN' || user.role === 'STAFF') {
                    navigate('/admin');
                }
            } catch (e) {
                // Ignore parse error
            }
        }
    }, [navigate]);
    const loginSchema = getLoginSchema(t);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        await login(data);
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen p-4"
            style={{ backgroundColor: 'var(--auth-page-bg)' }}
        >
            <Card
                className="w-full max-w-md backdrop-blur-md shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border-t rounded-3xl overflow-hidden"
                style={{
                    borderRadius: 'var(--panel-radius, 1.5rem)',
                    borderColor: 'var(--auth-input-border)' // generic border color match
                }}
            >
                <CardHeader>
                    <CardTitle className="text-2xl text-center" style={{ color: 'var(--auth-title-color)' }}>{t('login.title')}</CardTitle>
                    <CardDescription className="text-center" style={{ color: 'var(--auth-subtitle-color)' }}>
                        {t('login.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" style={{ color: 'var(--auth-label-color)' }}>{t('login.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('login.email_placeholder')}
                                {...register('email')}
                                style={{
                                    backgroundColor: 'var(--auth-input-bg)',
                                    color: 'var(--auth-input-text)',
                                    borderColor: 'var(--auth-input-border)'
                                }}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" style={{ color: 'var(--auth-label-color)' }}>{t('login.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                style={{
                                    backgroundColor: 'var(--auth-input-bg)',
                                    color: 'var(--auth-input-text)',
                                    borderColor: 'var(--auth-input-border)'
                                }}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                            style={{
                                backgroundColor: 'var(--auth-button-bg)',
                                color: 'var(--auth-button-text)'
                            }}
                        >
                            {isLoading ? t('login.loading') : t('login.submit')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <a
                        href="/auth/google"
                        className="text-sm hover:underline"
                        style={{ color: 'var(--auth-link-color)' }}
                    >
                        {t('login.google')}
                    </a>
                </CardFooter>
            </Card>
        </div>
    );
}
