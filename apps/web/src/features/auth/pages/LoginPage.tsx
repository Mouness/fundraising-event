import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

type LoginForm = z.infer<typeof loginSchema>;

import { useLogin } from '../hooks/useLogin';

// ... imports

export const LoginPage = () => {
    const { t } = useTranslation('common');
    const { login, error, isLoading } = useLogin();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        await login(data);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">{t('login.title')}</CardTitle>
                    <CardDescription className="text-center">
                        {t('login.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('login.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('login.email_placeholder')}
                                {...register('email')}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('login.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('login.loading') : t('login.submit')}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <a href="/auth/google" className="text-sm text-blue-600 hover:underline">
                        {t('login.google')}
                    </a>
                </CardFooter>
            </Card>
        </div>
    );
}
