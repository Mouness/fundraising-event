import { render, screen, fireEvent, waitFor } from '@test/utils'
import { LoginPage } from '@features/auth/pages/LoginPage'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock('@features/auth/hooks/useLogin', () => ({
    useLogin: () => ({
        login: mockLogin,
        error: null,
        isLoading: false,
    }),
}))

vi.mock('@core/components/ui/button', () => ({
    Button: ({ children, disabled, type, ...props }: any) => (
        <button disabled={disabled} type={type} {...props}>
            {children}
        </button>
    ),
}))
vi.mock('@core/components/ui/input', () => ({
    Input: ({ id, ...props }: any) => <input id={id} data-testid={id} {...props} />,
}))
vi.mock('@core/components/ui/card', () => {
    const MockDiv = ({ children }: any) => <div>{children}</div>
    return {
        Card: MockDiv,
        CardHeader: MockDiv,
        CardTitle: MockDiv,
        CardContent: MockDiv,
        CardDescription: MockDiv,
        CardFooter: MockDiv,
    }
})
vi.mock('@core/components/ui/label', () => ({
    Label: ({ htmlFor, children }: any) => <label htmlFor={htmlFor}>{children}</label>,
}))

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    it('should render login form', async () => {
        render(<LoginPage />)
        expect(await screen.findByText('login.title')).toBeDefined()
        expect(screen.getByLabelText('login.email')).toBeDefined()
        expect(screen.getByLabelText('login.password')).toBeDefined()
        expect(screen.getByText('login.submit')).toBeDefined()
    })

    it('should submit form with valid data', async () => {
        render(<LoginPage />)
        const emailInput = await screen.findByTestId('email')
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByTestId('password'), {
            target: { value: 'password123' },
        })

        fireEvent.click(screen.getByText('login.submit'))

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            })
        })
    })

    it('should display validation errors', async () => {
        render(<LoginPage />)
        const submitBtn = await screen.findByText('login.submit')
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText('validation.invalid_string.email')).toBeDefined()
            expect(screen.getByText('validation.too_small.string 1')).toBeDefined()
        })
        expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should redirect to admin if already logged in as ADMIN', async () => {
        const user = { role: 'ADMIN' }
        localStorage.setItem('token', 'fake-token')
        localStorage.setItem('user', JSON.stringify(user))

        render(<LoginPage />)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/admin')
        })
    })

    it('should redirect to admin if already logged in as STAFF', async () => {
        const user = { role: 'STAFF' }
        localStorage.setItem('token', 'fake-token')
        localStorage.setItem('user', JSON.stringify(user))

        render(<LoginPage />)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/admin')
        })
    })

    it('should not redirect if user parsing fails', () => {
        localStorage.setItem('token', 'fake-token')
        localStorage.setItem('user', 'invalid-json')

        render(<LoginPage />)

        expect(mockNavigate).not.toHaveBeenCalled()
    })
})
