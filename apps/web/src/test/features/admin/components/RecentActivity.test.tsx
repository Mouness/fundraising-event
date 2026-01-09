import { render, screen } from '@testing-library/react'
import { RecentActivity } from '@/features/admin/components/RecentActivity'
import { useDonations } from '@features/donation/hooks/useDonations'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@features/donation/hooks/useDonations', () => ({
    useDonations: vi.fn(),
}))

describe('RecentActivity', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loader while loading', () => {
        ;(useDonations as any).mockReturnValue({ donations: [], isLoading: true })
        render(<RecentActivity />)
        // The loader doesn't have a label by default, but it's a svg with animate-spin
        expect(document.querySelector('.animate-spin')).toBeDefined()
    })

    it('shows empty message when no donations', () => {
        ;(useDonations as any).mockReturnValue({ donations: [], isLoading: false })
        render(<RecentActivity />)
        expect(screen.getByText('dashboard.activity.empty')).toBeDefined()
    })

    it('renders list of donations', () => {
        const mockDonations = [
            {
                id: '1',
                donorName: 'Alice',
                amount: '5000', // 50.00
                createdAt: new Date().toISOString(),
                isAnonymous: false,
            },
            {
                id: '2',
                donorName: 'Anonymous',
                amount: '1000', // 10.00
                createdAt: new Date().toISOString(),
                isAnonymous: true,
            },
        ]
        ;(useDonations as any).mockReturnValue({
            donations: mockDonations,
            isLoading: false,
        })

        render(<RecentActivity />)

        expect(screen.getByText('Alice')).toBeDefined()
        expect(screen.getByText('common.anonymous')).toBeDefined()
        // formatCurrency in mock returns "useCurrencyFormatter:amount:currency"
        expect(screen.getByText('+useCurrencyFormatter:50:EUR')).toBeDefined()
        expect(screen.getByText('+useCurrencyFormatter:10:EUR')).toBeDefined()
    })
})
