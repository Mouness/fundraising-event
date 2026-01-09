import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@core/components/ui/button';
import { RefreshCcw, Home } from 'lucide-react';

export const RouteError = () => {
    const error = useRouteError();
    const { t } = useTranslation();

    let errorMessage = t('error.message', "We encountered an unexpected error. Don't worry, your data is safe.");
    let errorTitle = t('error.title', 'Something went wrong');

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            errorTitle = t('not_found.title', 'Page Not Found');
            errorMessage = t('not_found.message', "The page you are looking for doesn't exist.");
        } else {
            errorTitle = `${t('error.title', 'Error')} ${error.status}`;
            errorMessage = error.statusText;
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <div className="max-w-md w-full bg-background border shadow-xl rounded-xl p-8 text-center space-y-6">
                <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCcw className="h-8 w-8 text-destructive animate-spin-slow" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {errorTitle}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {errorMessage}
                    </p>
                </div>

                {import.meta.env.DEV && error instanceof Error && (
                    <div className="p-4 bg-muted rounded text-xs text-left overflow-auto max-h-32 font-mono">
                        {error.message}
                        {error.stack && <div className="mt-2 opacity-50">{error.stack}</div>}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="default" className="flex-1" onClick={handleReset}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {t('error.reload', 'Try Again')}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/'}>
                        <Home className="mr-2 h-4 w-4" />
                        {t('common.home', 'Go Home')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
