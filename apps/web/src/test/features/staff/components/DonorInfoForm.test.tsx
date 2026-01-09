import { render, screen, fireEvent } from '@testing-library/react'
import { DonorInfoForm } from '@features/staff/components/DonorInfoForm'
import { describe, it, expect, vi } from 'vitest'

// Mock translation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}))

describe('DonorInfoForm', () => {
    const defaultProps = {
        name: '',
        email: '',
        onNameChange: vi.fn(),
        onEmailChange: vi.fn(),
    }

    it('should render input fields with labels', () => {
        render(<DonorInfoForm {...defaultProps} />)

        expect(screen.getByLabelText('staff.donor.name_label')).toBeDefined()
        expect(screen.getByLabelText('staff.donor.email_label')).toBeDefined()
    })

    it('should call onNameChange when name input changes', () => {
        render(<DonorInfoForm {...defaultProps} />)

        const nameInput = screen.getByLabelText('staff.donor.name_label')
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        expect(defaultProps.onNameChange).toHaveBeenCalledWith('John Doe')
    })

    it('should call onEmailChange when email input changes', () => {
        render(<DonorInfoForm {...defaultProps} />)

        const emailInput = screen.getByLabelText('staff.donor.email_label')
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        expect(defaultProps.onEmailChange).toHaveBeenCalledWith('john@example.com')
    })

    it('should disable inputs when disabled prop is true', () => {
        render(<DonorInfoForm {...defaultProps} disabled={true} />)

        expect(screen.getByLabelText('staff.donor.name_label')).toBeDisabled()
        expect(screen.getByLabelText('staff.donor.email_label')).toBeDisabled()
    })
})
