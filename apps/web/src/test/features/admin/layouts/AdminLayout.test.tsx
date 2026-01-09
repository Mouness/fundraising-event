import { render, screen, rtlRender, TestWrapperNoRouter } from '@test/utils'
import { AdminLayout } from '@features/admin/layouts/AdminLayout'
import { vi, describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppConfigProvider } from '@core/providers/AppConfigProvider'

// Mock child components
vi.mock('@core/components/ui/page-loader', () => ({
    PageLoader: () => <div data-testid="page-loader">Loading...</div>,
}))

vi.mock('@core/components/AppHeader', () => ({
    AppHeader: ({ title }: { title: string }) => <div data-testid="app-header">{title}</div>,
}))

describe('AdminLayout', () => {
    it('renders header and sidebar links', async () => {
        render(<AdminLayout />)
        expect(await screen.findByTestId('app-header')).toHaveTextContent('admin_layout.title')
        expect(screen.getByText('nav.dashboard')).toBeInTheDocument()
        expect(screen.getByText('nav.events')).toBeInTheDocument()
        expect(screen.getByText('nav.staff')).toBeInTheDocument()
        expect(screen.getByText('nav.settings')).toBeInTheDocument()
    })

    it('marks active link based on current path', async () => {
        rtlRender(
            <MemoryRouter initialEntries={['/admin/events']}>
                <AppConfigProvider>
                    <Routes>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="events" element={<div>Events Page</div>} />
                        </Route>
                    </Routes>
                </AppConfigProvider>
            </MemoryRouter>,
            { wrapper: TestWrapperNoRouter },
        )

        const eventsLink = await screen.findByText('nav.events')
        const aLink = eventsLink.closest('a')
        expect(aLink).toHaveClass('bg-primary/10')
        expect(aLink).toHaveClass('text-primary')

        const dashboardLink = screen.getByText('nav.dashboard').closest('a')
        expect(dashboardLink).not.toHaveClass('bg-primary/10')
    })

    it('renders outlet content', async () => {
        rtlRender(
            <MemoryRouter initialEntries={['/admin/test']}>
                <AppConfigProvider>
                    <Routes>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route
                                path="test"
                                element={<div data-testid="child-content">Child Content</div>}
                            />
                        </Route>
                    </Routes>
                </AppConfigProvider>
            </MemoryRouter>,
            { wrapper: TestWrapperNoRouter },
        )

        expect(await screen.findByTestId('child-content')).toBeInTheDocument()
    })
})
