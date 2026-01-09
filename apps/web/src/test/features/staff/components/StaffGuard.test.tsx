import { render, screen } from '@testing-library/react'
import { StaffGuard } from '@features/staff/components/StaffGuard'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useStaffAuth } from '@features/staff/hooks/useStaffAuth'
import { useEvent } from '@features/events/context/EventContext'

// Mock mocks
vi.mock('@features/staff/hooks/useStaffAuth', () => ({
    useStaffAuth: vi.fn(),
}))

vi.mock('@features/events/context/EventContext', () => ({
    useEvent: vi.fn(),
}))

describe('StaffGuard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show nothing while loading event', () => {
        vi.mocked(useStaffAuth).mockReturnValue({
            isStaffAuthenticated: vi.fn(),
        } as any)
        vi.mocked(useEvent).mockReturnValue({
            event: null,
            isLoading: true,
        } as any)

        const { container } = render(<StaffGuard />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should redirect to login if not authenticated', () => {
        vi.mocked(useStaffAuth).mockReturnValue({
            isStaffAuthenticated: vi.fn().mockReturnValue(false),
        } as any)
        vi.mocked(useEvent).mockReturnValue({
            event: { id: 'evt-1' },
            isLoading: false,
        } as any)

        render(
            <MemoryRouter initialEntries={['/test-event/staff/collect']}>
                <Routes>
                    <Route path="/:slug/staff/collect" element={<StaffGuard />} />
                    <Route path="/:slug/staff/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>,
        )

        expect(screen.getByText('Login Page')).toBeDefined()
    })

    it('should render outlet if authenticated', () => {
        vi.mocked(useStaffAuth).mockReturnValue({
            isStaffAuthenticated: vi.fn().mockReturnValue(true),
        } as any)
        vi.mocked(useEvent).mockReturnValue({
            event: { id: 'evt-1' },
            isLoading: false,
        } as any)

        render(
            <MemoryRouter initialEntries={['/test-event/staff/collect']}>
                <Routes>
                    <Route path="/:slug/staff/collect" element={<StaffGuard />}>
                        <Route index element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        )

        expect(screen.getByText('Protected Content')).toBeDefined()
    })
})
