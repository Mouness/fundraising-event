import { render, screen, fireEvent } from '@testing-library/react'
import { DonationAmountSelector } from '@/features/donation/components/DonationAmountSelector'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@core/hooks/useCurrencyFormatter', () => ({
    useCurrencyFormatter: () => ({
        formatCurrency: (amt: number) => `$${amt}`,
    }),
}))

describe('DonationAmountSelector', () => {
    const defaultProps = {
        selectedAmount: 50,
        onAmountSelect: vi.fn(),
        register: vi.fn().mockReturnValue({ onChange: vi.fn() }),
        errors: {},
        setValue: vi.fn(),
    }

    it('renders suggested amounts', () => {
        render(<DonationAmountSelector {...defaultProps} />)
        expect(screen.getByText('$10')).toBeDefined()
        expect(screen.getByText('$20')).toBeDefined()
        expect(screen.getByText('$50')).toBeDefined()
        expect(screen.getByText('$100')).toBeDefined()
    })

    it('calls onAmountSelect when a suggested amount is clicked', () => {
        render(<DonationAmountSelector {...defaultProps} />)
        fireEvent.click(screen.getByText('$20'))
        expect(defaultProps.onAmountSelect).toHaveBeenCalledWith(20)
    })

    it('calls onAmountSelect when custom amount is entered', () => {
        const mockOnChange = vi.fn()
        const register = vi.fn().mockReturnValue({ onChange: mockOnChange, name: 'amount' })
        render(<DonationAmountSelector {...defaultProps} register={register} />)

        const input = screen.getByPlaceholderText('donation.custom_amount')
        fireEvent.change(input, { target: { value: '75' } })

        expect(defaultProps.onAmountSelect).toHaveBeenCalledWith(75)
        expect(mockOnChange).toHaveBeenCalled()
    })

    it('renders error message when present', () => {
        const errors = {
            amount: { message: 'Invalid amount' },
        }
        render(<DonationAmountSelector {...defaultProps} errors={errors as any} />)
        expect(screen.getByText('Invalid amount')).toBeDefined()
    })

    it('applies selected styles to the active amount', () => {
        render(<DonationAmountSelector {...defaultProps} selectedAmount={100} />)
        const btn = screen.getByText('$100')
        // We can't easily check var() values but we can check the class or active state if it was there
        // Here we use variant='default' for selected
        expect(btn.className).toContain('shadow-lg')
    })
})
