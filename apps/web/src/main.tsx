import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './lib/i18n'
import './main.css'
import '@fundraising/white-labeling/src/theme/theme.default.css'
import { router } from './app/router'
import { AppProviders } from './app/providers'
import { ErrorBoundary } from './providers/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
)
