import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollectorPage } from '@/features/staff/pages/CollectorPage';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncService } from '@/features/staff/services/sync.service';

// Mocks
vi.mock('@/features/staff/services/sync.service', () => ({
    SyncService: {
        submitDonation: vi.fn(),
        processQueue: vi.fn().mockResolvedValue(0),
    },
}));

vi.mock('@/features/staff/components/Keypad', () => ({
    Keypad: ({ onKeyPress, onDelete, onClear }: any) => (
        <div>
            <button onClick={() => onKeyPress('1')}>1</button>
            <button onClick={() => onKeyPress('00')}>00</button>
            <button onClick={onDelete}>Del</button>
            <button onClick={onClear}>Clear</button>
        </div>
    ),
}));

vi.mock('@/features/staff/components/DonationTypeSelector', () => ({
    DonationTypeSelector: ({ onChange }: any) => (
        <button onClick={() => onChange('check')}>Check</button>
    ),
}));

vi.mock('@/features/staff/components/DonorInfoForm', () => ({
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

    it('should render initial state', () => {
        render(<CollectorPage />);
        expect(screen.getByText('Enter Amount')).toBeDefined();
        // Check initial amount display (might need improved text matcher if formatted)
        expect(screen.getByText('$0.00')).toBeDefined();
    });

    it('should update amount via keypad', () => {
        render(<CollectorPage />);
        fireEvent.click(screen.getByText('1'));
        fireEvent.click(screen.getByText('00'));

        expect(screen.getByText('$1.00')).toBeDefined(); // 100 cents
    });

    it('should submit donation', async () => {
        (SyncService.submitDonation as any).mockResolvedValue({ success: true, offline: false });
        render(<CollectorPage />);

        // Enter amount 200 ($2.00)
        fireEvent.click(screen.getByText('1'));
        fireEvent.click(screen.getByText('1')); // 11 cents? No. Keypad logic: prev + key. '1' -> '1'. '00' -> '100'.
        // Wait, '1' -> '1'. '00' -> '100'. = $1.00.
        // Let's clear first.
        fireEvent.click(screen.getByText('Clear'));

        fireEvent.click(screen.getByText('1')); // '1'
        fireEvent.click(screen.getByText('00')); // '100' ($1.00)

        const submitBtn = screen.getByText('Collect Donation');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(SyncService.submitDonation).toHaveBeenCalledWith(expect.objectContaining({
                amount: 100,
                type: 'cash'
            }));
            expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('SUCCESS'));
        });
    });
});
