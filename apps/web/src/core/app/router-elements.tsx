import { Suspense, type ComponentType } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { PageLoader } from '@core/components/ui/page-loader'
import { AppConfigProvider } from '@core/providers/AppConfigProvider'
import { EventProvider } from '@features/events/context/EventContext'
import { RouteError } from '@core/components/RouteError'

// Helper for lazy loading
export const Loadable = (Component: ComponentType, fallback = <PageLoader />) => (
    <Suspense fallback={fallback}>
        <Component />
    </Suspense>
)

// Wrapper to provide event context based on URL slug
export const EventContextWrapper = () => {
    const { slug } = useParams<{ slug: string }>()
    return (
        <AppConfigProvider slug={slug}>
            <EventProvider>
                <Outlet />
            </EventProvider>
        </AppConfigProvider>
    )
}

export const EventAdminWrapper = () => {
    const { slug } = useParams<{ slug: string }>()
    return (
        <AppConfigProvider slug={slug}>
            <Outlet />
        </AppConfigProvider>
    )
}

export const RootLayout = () => (
    <AppConfigProvider>
        <Outlet />
    </AppConfigProvider>
)

export const RootError = () => (
    <AppConfigProvider>
        <RouteError />
    </AppConfigProvider>
)
