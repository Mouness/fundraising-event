import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('common');

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-md text-center shadow-lg border-muted">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <span className="text-6xl">😕</span>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        404
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <h2 className="text-xl font-semibold mb-2">{t('not_found.title')}</h2>
                    <p className="text-muted-foreground">
                        {t('not_found.message')}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={() => navigate('/')} variant="default" size="lg">
                        {t('not_found.button')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
