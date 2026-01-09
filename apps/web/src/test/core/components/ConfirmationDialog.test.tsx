import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmationDialog } from '@/core/components/ConfirmationDialog'
import { describe, it, expect, vi } from 'vitest'

describe('ConfirmationDialog', () => {
    it('renders when open', () => {
        const onOpenChange = vi.fn()
        const onConfirm = vi.fn()

        render(
            <ConfirmationDialog
                open={true}
                onOpenChange={onOpenChange}
                onConfirm={onConfirm}
                title="Confirm Action"
                description="Are you sure you want to do this?"
            />,
        )

        expect(screen.getByText('Confirm Action')).toBeDefined()
        expect(screen.getByText('Are you sure you want to do this?')).toBeDefined()
    })

    it('calls onConfirm and closes when confirm button is clicked', () => {
        const onOpenChange = vi.fn()
        const onConfirm = vi.fn()

        render(<ConfirmationDialog open={true} onOpenChange={onOpenChange} onConfirm={onConfirm} />)

        const confirmBtn = screen.getByText('common.confirm')
        fireEvent.click(confirmBtn)

        expect(onConfirm).toHaveBeenCalled()
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange(false) when cancel button is clicked', () => {
        const onOpenChange = vi.fn()
        const onConfirm = vi.fn()

        render(<ConfirmationDialog open={true} onOpenChange={onOpenChange} onConfirm={onConfirm} />)

        const cancelBtn = screen.getByText('common.cancel')
        fireEvent.click(cancelBtn)

        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(onConfirm).not.toHaveBeenCalled()
    })

    it('uses default values if props are not provided', () => {
        render(<ConfirmationDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />)

        expect(screen.getByText('confirmation.title')).toBeDefined()
        expect(screen.getByText('confirmation.description')).toBeDefined()
    })
})
