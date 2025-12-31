import { render, screen, waitFor } from '@testing-library/react';
import { EventSettingsPage } from '@/features/events/pages/EventSettingsPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/api');
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, type }: any) => (
        <button onClick={onClick} disabled={disabled} type={type}>
            {children}
        </button>
    ),
}));
vi.mock('@/components/ui/input', () => ({
    Input: ({ id, value, onChange, type, ...props }: any) => (
        <input data-testid={id} id={id} value={value} onChange={onChange} type={type} {...props} />
    ),
}));
vi.mock('@/components/ui/label', () => ({
    Label: ({ htmlFor, children }: any) => <label htmlFor={htmlFor}>{children}</label>,
}));
vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('lucide-react', () => ({
    Loader2: () => <div>Loading...</div>,
    Save: () => <span>Save</span>,
}));

describe('EventSettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load event data on mount', async () => {
        (api.get as any).mockResolvedValue({
            data: [
                {
                    id: '123',
                    name: 'Test Event',
                    goalAmount: 1000,
                    slug: 'test-event',
                    themeConfig: {
                        assets: { logo: 'logo.png' },
                        variables: { '--primary': '#FF0000' },
                    },
                },
            ],
        });

        render(<EventSettingsPage />);

        await waitFor(() => {
            expect(screen.getByDisplayValue('Test Event')).toBeDefined();
            expect(screen.getByDisplayValue('1000')).toBeDefined();
            expect(screen.getByDisplayValue('#FF0000')).toBeDefined();
        });
    });

    it('should show error if no event found', async () => {
        (api.get as any).mockResolvedValue({ data: [] });

        render(<EventSettingsPage />);

        await waitFor(() => {
            expect(screen.getByText(/No event found/i)).toBeDefined();
        });
    });
});
