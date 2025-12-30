import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as useLoginHook from '@/features/auth/hooks/useLogin';

// Mock dependencies
const mockLogin = vi.fn();
vi.mock('@/features/auth/hooks/useLogin', () => ({
    useLogin: () => ({
        login: mockLogin,
        error: null,
        isLoading: false,
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, type, ...props }: any) => <button disabled={disabled} type={type} {...props}>{children}</button>,
}));
vi.mock('@/components/ui/input', () => ({
    Input: ({ id, ...props }: any) => <input id={id} data-testid={id} {...props} />,
}));
vi.mock('@/components/ui/card', () => {
    const MockDiv = ({ children }: any) => <div>{children}</div>;
    return {
        Card: MockDiv,
        CardHeader: MockDiv,
        CardTitle: MockDiv,
        CardContent: MockDiv,
        CardDescription: MockDiv,
        CardFooter: MockDiv,
    };
});
vi.mock('@/components/ui/label', () => ({
    Label: ({ htmlFor, children }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render login form', () => {
        render(<LoginPage />);
        expect(screen.getByText('login.title')).toBeDefined();
        expect(screen.getByLabelText('login.email')).toBeDefined();
        expect(screen.getByLabelText('login.password')).toBeDefined();
        expect(screen.getByText('login.submit')).toBeDefined();
    });

    it('should submit form with valid data', async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByText('login.submit'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('should display validation errors', async () => {
        render(<LoginPage />);

        fireEvent.click(screen.getByText('login.submit'));

        await waitFor(() => {
            expect(screen.getByText('Invalid email address')).toBeDefined();
            expect(screen.getByText('Password is required')).toBeDefined();
        });
        expect(mockLogin).not.toHaveBeenCalled();
    });
});
