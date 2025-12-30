import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardPage } from '@/features/admin/pages/DashboardPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/api');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/features/admin/components/DashboardStats', () => ({
    DashboardStats: () => <div data-testid="dashboard-stats">Stats</div>,
}));
vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <div>{children}</div>,
    CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardDescription: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));
vi.mock('lucide-react', () => ({
    Loader2: () => <span>Loading...</span>,
    Download: () => <span>Download</span>,
}));

// Mock window.URL
window.URL.createObjectURL = vi.fn();
window.URL.revokeObjectURL = vi.fn();

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render dashboard components', () => {
        render(<DashboardPage />);
        expect(screen.getByText('dashboard.title')).toBeDefined();
        expect(screen.getByTestId('dashboard-stats')).toBeDefined();
        expect(screen.getByText('Export Receipts (ZIP)')).toBeDefined();
    });

    it('should handle export action', async () => {
        (api.get as any).mockResolvedValue({ data: new Blob(['data']) });

        render(<DashboardPage />);

        const exportBtn = screen.getByText('Export Receipts (ZIP)');
        fireEvent.click(exportBtn);

        expect(api.get).toHaveBeenCalledWith('/export/receipts/zip', expect.objectContaining({ responseType: 'blob' }));
    });
});
