import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import '@core/lib/i18n'
import '@core/lib/zod-i18n'
import './main.css'
import { router } from '@core/app/router'
import { AppProviders } from '@core/app/providers'
import { ErrorBoundary } from '@core/providers/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <AppProviders>
                <RouterProvider router={router} />
            </AppProviders>
        </ErrorBoundary>
    </StrictMode>,
)
