import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@core/components/ui/button'
import { RefreshCcw, Home } from 'lucide-react'
import { withTranslation, type WithTranslation } from 'react-i18next'

interface Props extends WithTranslation {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

class ErrorBoundaryBase extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null })
        window.location.reload()
    }

    public render() {
        const { t, fallback } = this.props

        if (this.state.hasError) {
            if (fallback) {
                return fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                    <div className="max-w-md w-full bg-background border shadow-xl rounded-xl p-8 text-center space-y-6">
                        <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <RefreshCcw className="h-8 w-8 text-destructive animate-spin-slow" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {t('error.title', 'Something went wrong')}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {t(
                                    'error.message',
                                    "We encountered an unexpected error. Don't worry, your data is safe.",
                                )}
                            </p>
                        </div>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="p-4 bg-muted rounded text-xs text-left overflow-auto max-h-32 font-mono">
                                {this.state.error.message}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="default" className="flex-1" onClick={this.handleReset}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                {t('error.reload', 'Try Again')}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => (window.location.href = '/')}
                            >
                                <Home className="mr-2 h-4 w-4" />
                                {t('common.home', 'Go Home')}
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export const ErrorBoundary = withTranslation('common')(ErrorBoundaryBase)
