import { render, screen, fireEvent, waitFor } from '@test/utils';
import { CollectorPage } from '@features/staff/pages/CollectorPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncService } from '@features/staff/services/sync.service';
import { toast } from 'sonner';
import { useStaffAuth } from '@features/staff/hooks/useStaffAuth';

// Mocks
vi.mock('@features/staff/services/sync.service', () => ({
    SyncService: {
        submitDonation: vi.fn(),
        processQueue: vi.fn().mockResolvedValue(0),
    },
}));

vi.mock('@features/staff/hooks/useStaffAuth', () => ({
    useStaffAuth: vi.fn(() => ({
        getStaffUser: () => ({ id: 'staff-1', eventId: 'test-event' }),
        isStaffAuthenticated: vi.fn((_id?: string) => true),
    })),
}));

vi.mock('@features/events/context/EventContext', () => ({
    useEvent: () => ({
        event: { id: 'test-event', slug: 'test-event' },
        isLoading: false,
    }),
}));

vi.mock('@features/staff/components/Keypad', () => ({
    Keypad: ({ onKeyPress, onDelete, onClear }: any) => (
        <div>
            <button onClick={() => onKeyPress('1')}>1</button>
            <button onClick={() => onKeyPress('00')}>00</button>
            <button onClick={onDelete}>Del</button>
            <button onClick={onClear}>Clear</button>
        </div>
    ),
}));

vi.mock('@features/staff/components/DonationTypeSelector', () => ({
    DonationTypeSelector: ({ onChange }: any) => (
        <button onClick={() => onChange('check')}>Check</button>
    ),
}));

vi.mock('@features/staff/components/DonorInfoForm', () => ({
    DonorInfoForm: ({ onNameChange }: any) => (
        <input placeholder="Donor Name" onChange={(e) => onNameChange(e.target.value)} />
    ),
}));

describe('CollectorPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock alert
        vi.spyOn(window, 'alert').mockImplementation(() => { });
    });

    it('should render initial state', async () => {
        render(<CollectorPage />);
        expect(await screen.findByText('staff.enter_amount')).toBeDefined();
        // Check initial amount display (might need improved text matcher if formatted)
        expect(screen.getByText('useCurrencyFormatter:0:EUR')).toBeDefined();
    });

    it('should update amount via keypad', async () => {
        render(<CollectorPage />);
        fireEvent.click(await screen.findByText('1'));
        fireEvent.click(screen.getByText('00'));

        expect(await screen.findByText('useCurrencyFormatter:1:EUR')).toBeDefined(); // 100 cents = $1.00
    });

    it('should submit donation', async () => {
        (SyncService.submitDonation as any).mockResolvedValue({ success: true, offline: false });
        render(<CollectorPage />);

        // Enter amount ($1.00)
        fireEvent.click(await screen.findByText('1')); // '1'
        fireEvent.click(screen.getByText('00')); // '100' ($1.00)
        expect(await screen.findByText('useCurrencyFormatter:1:EUR')).toBeDefined();

        const submitBtn = screen.getByText('staff.collect_button');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(SyncService.submitDonation).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 100,
                    type: 'cash'
                }),
                'test-event'
            );
            expect(toast.success).toHaveBeenCalled();
        });
    });
    it('should show error on submission failure', async () => {
        (SyncService.submitDonation as any).mockResolvedValue({ success: false, error: 'Network Error' });
        render(<CollectorPage />);

        // Enter amount ($1.00)
        fireEvent.click(await screen.findByText('1'));
        fireEvent.click(screen.getByText('00'));

        const submitBtn = screen.getByText('staff.collect_button');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Network Error');
        });
    });

    it('should show error if session is invalid', async () => {
        // Mock getStaffUser to return null. Use mockReturnValue to persist across re-renders.
        vi.mocked(useStaffAuth).mockReturnValue({
            getStaffUser: () => null,
            isStaffAuthenticated: vi.fn(() => true),
        } as any);

        render(<CollectorPage />);

        // Enter amount
        fireEvent.click(await screen.findByText('1'));
        fireEvent.click(screen.getByText('00'));

        const submitBtn = screen.getByText('staff.collect_button');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('staff.session_invalid');
            expect(SyncService.submitDonation).not.toHaveBeenCalled();
        });
    });
});
