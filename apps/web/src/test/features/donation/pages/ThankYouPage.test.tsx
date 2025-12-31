import { render, screen } from '@testing-library/react';
import { ThankYouPage } from '@/features/donation/pages/ThankYouPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as router from 'react-router-dom';

// Mocks
vi.mock('@/providers/AppConfigProvider', () => ({
    useAppConfig: () => ({
        config: {
            donation: { sharing: { enabled: true, networks: ['twitter'] } }
        }
    }),
}));
vi.mock('@/lib/confetti', () => ({
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
vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardFooter: ({ children }: any) => <div>{children}</div>,
}));

describe('ThankYouPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
    });
});
