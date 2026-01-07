import { render, screen, fireEvent } from '@testing-library/react';
import { ThankYouPage } from '@features/donation/pages/ThankYouPage';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import * as router from 'react-router-dom';
import { useAppConfig } from '@core/providers/AppConfigProvider';

// Mocks
vi.mock('@core/providers/AppConfigProvider', () => ({
    useAppConfig: vi.fn(() => ({
        config: {
            donation: { sharing: { enabled: true, networks: ['twitter'] } }
        }
    })),
}));
vi.mock('@core/lib/confetti', () => ({
    fireConfetti: vi.fn(),
}));
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLocation: vi.fn(),
        Navigate: ({ to }: any) => <div>Redirected to {to}</div>,
        Link: ({ to, children }: any) => <a href={to}>{children}</a>,
    };
});
// Simple mock for UI components
vi.mock('@core/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardFooter: ({ children }: any) => <div>{children}</div>,
}));

describe('ThankYouPage', () => {
    const originalOpen = window.open;
    beforeEach(() => {
        vi.clearAllMocks();
        window.open = vi.fn();
    });

    afterAll(() => {
        window.open = originalOpen;
    });

    it('should redirect if no state', () => {
        (router.useLocation as any).mockReturnValue({ state: null });
        render(<ThankYouPage />);
        expect(screen.getByText('Redirected to /donate')).toBeDefined();
    });

    it('should render success message if state provided', () => {
        (router.useLocation as any).mockReturnValue({
            state: { amount: 100, transactionId: 'tx123', donorName: 'John' }
        });
        render(<ThankYouPage />);
        expect(screen.getByText('donation.success')).toBeDefined();
        expect(screen.getByText(/donation.success_detail \$100/)).toBeDefined();
        expect(screen.getByText('tx123')).toBeDefined();
        expect(screen.getByText('John')).toBeDefined();
    });

    it('should handle social sharing', async () => {
        vi.mocked(useAppConfig).mockReturnValue({
            config: {
                donation: {
                    sharing: {
                        enabled: true,
                        networks: ['twitter', 'facebook', 'linkedin']
                    }
                }
            }
        } as any);

        (router.useLocation as any).mockReturnValue({
            state: { amount: 100 }
        });
        render(<ThankYouPage />);

        const twitterBtn = screen.getByLabelText('Twitter');
        await fireEvent.click(twitterBtn);
        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('twitter.com/intent/tweet'),
            '_blank',
            expect.any(String)
        );

        const facebookBtn = screen.getByLabelText('Facebook');
        await fireEvent.click(facebookBtn);
        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('facebook.com/sharer/sharer.php'),
            '_blank',
            expect.any(String)
        );

        const linkedinBtn = screen.getByLabelText('LinkedIn');
        await fireEvent.click(linkedinBtn);
        expect(window.open).toHaveBeenCalledWith(
            expect.stringContaining('linkedin.com/sharing/share-offsite'),
            '_blank',
            expect.any(String)
        );
    });

    it('should render multiple social networks based on config', () => {
        vi.mocked(useAppConfig).mockReturnValue({
            config: {
                donation: {
                    sharing: {
                        enabled: true,
                        networks: ['twitter', 'facebook', 'linkedin']
                    }
                }
            }
        } as any);

        (router.useLocation as any).mockReturnValue({
            state: { amount: 100 }
        });

        render(<ThankYouPage />);

        expect(screen.getByRole('button', { name: /twitter/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /facebook/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /linkedin/i })).toBeDefined();
    });
});
