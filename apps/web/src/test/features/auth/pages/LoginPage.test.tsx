import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import * as useLoginHook from '@/features/auth/hooks/useLogin';

// Mock the useLogin hook
const loginMock = vi.fn();
vi.spyOn(useLoginHook, 'useLogin').mockReturnValue({
    login: loginMock,
    isLoading: false,
    error: null,
});

describe('LoginPage', () => {
    it('should render login form', () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        expect(screen.getByLabelText('login.email')).toBeInTheDocument();
        expect(screen.getByLabelText('login.password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'login.submit' })).toBeInTheDocument();
    });

    it('should show validation error on empty submit', async () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'login.submit' }));

        await waitFor(() => {
            expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        });
    });

    it('should call login on valid submit', async () => {
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('login.email'), { target: { value: 'admin@example.com' } });
        fireEvent.change(screen.getByLabelText('login.password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'login.submit' }));

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'admin@example.com',
                    password: 'password123'
                })
            );
        });
    });
});
