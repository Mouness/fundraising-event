import { render, screen, fireEvent } from '@testing-library/react'
import { DonationTypeSelector } from '@features/staff/components/DonationTypeSelector'
import { describe, it, expect, vi } from 'vitest'

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal: string) => defaultVal || key,
    }),
}))

describe('DonationTypeSelector', () => {
    it('should render all donation types', () => {
        render(<DonationTypeSelector value="cash" onChange={vi.fn()} />)

        expect(screen.getByText('Cash')).toBeDefined()
        expect(screen.getByText('Check')).toBeDefined()
        expect(screen.getByText('Pledge')).toBeDefined()
        expect(screen.getByText('Other')).toBeDefined()
    })

    it('should call onChange callback when a type is clicked', () => {
        const onChange = vi.fn()
        render(<DonationTypeSelector value="cash" onChange={onChange} />)

        fireEvent.click(screen.getByText('Check'))
        expect(onChange).toHaveBeenCalledWith('check')
    })

    it('should apply active styling to selected type', () => {
        render(<DonationTypeSelector value="cash" onChange={vi.fn()} />)

        const cashButton = screen.getByText('Cash').closest('button')
        const checkButton = screen.getByText('Check').closest('button')

        expect(cashButton).toHaveStyle({
            backgroundColor: 'var(--staff-type-button-selected-bg)',
        })
        expect(checkButton).toHaveStyle({
            backgroundColor: 'var(--staff-type-button-bg)',
        })
    })

    it('should disable buttons when disabled prop is true', () => {
        render(<DonationTypeSelector value="cash" onChange={vi.fn()} disabled={true} />)

        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
            expect(button).toBeDisabled()
        })
    })
})
