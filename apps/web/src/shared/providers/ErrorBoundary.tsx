import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/ui/button';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="text-center space-y-4 max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
                        <h1 className="text-4xl font-bold text-gray-900">Oops!</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Something went wrong</h2>
                        <p className="text-gray-500">
                            We apologize for the inconvenience. The application encountered an unexpected error.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="text-left bg-red-50 p-4 rounded text-xs text-red-600 overflow-auto max-h-48">
                                {this.state.error.toString()}
                            </div>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
