import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthSuccessPage } from '../../../../features/auth/pages/AuthSuccessPage'

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}))

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('AuthSuccessPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    it('renders loading message', () => {
        render(
            <MemoryRouter>
                <AuthSuccessPage />
            </MemoryRouter>,
        )
        expect(screen.getByText('login.logging_in')).toBeDefined()
    })

    it('navigates to login if no token provided', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <MemoryRouter initialEntries={['/auth/success']}>
                <AuthSuccessPage />
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login')
        })

        consoleSpy.mockRestore()
    })

    it('stores token and user then navigates to home when token is present', async () => {
        const token = 'fake-jwt-token'
        const user = JSON.stringify({ id: 1, name: 'Test User' })

        // Encode the user JSON as the backend would (or searchParams expects decoded if passed literally)
        // searchParams.get() decodes automatically.
        // We'll simulate visiting ?token=...&user=...
        const search = `?token=${token}&user=${encodeURIComponent(user)}`

        render(
            <MemoryRouter initialEntries={[`/auth/success${search}`]}>
                <AuthSuccessPage />
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe(token)
            expect(localStorage.getItem('user')).toBe(user)
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })
    })

    it('handles invalid user json gracefully', async () => {
        // Can't easily force JSON.parse error if simple string, but logic is inside try-catch.
        // If user param is not json logic might fail or just store it.
        // The component does:  if (userJson) { try { localStorage.setItem('user', userJson); } ... }
        // Wait, the component catches errors but actually doesn't seem to parse it?
        // It says: localStorage.setItem('user', userJson);
        // It's just converting it.
        // Let's verify it stores even if not json, or if parsed?
        // The code:
        /*
            if (userJson) {
                try {
                     localStorage.setItem('user', userJson);
                } catch (e) {
        */
        // localStorage.setItem doesn't throw on string.
        // So the try/catch is redundant unless there was parsing logic removed.
        // We'll just test that it navigates even with weird user data.

        const token = 'fake-token'
        const search = `?token=${token}&user=invalid-json`

        render(
            <MemoryRouter initialEntries={[`/auth/success${search}`]}>
                <AuthSuccessPage />
            </MemoryRouter>,
        )

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe(token)
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })
    })
})
