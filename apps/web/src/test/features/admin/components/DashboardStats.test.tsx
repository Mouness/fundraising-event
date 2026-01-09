import { render, screen } from '@testing-library/react'
import { DashboardStats } from '@/features/admin/components/DashboardStats'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@features/admin/mocks/dashboard', () => ({
    DASHBOARD_STATS: {
        totalRevenue: { value: '$10,000', change: '+5%', period: 'last month' },
        activeEvents: { value: '12', change: '+2', period: 'last month' },
        donations: { value: '150', change: '+10', period: 'last month' },
        staffMembers: { value: '5', change: '0', period: 'last month' },
    },
}))

describe('DashboardStats', () => {
    it('renders all stat cards with correct data', () => {
        render(<DashboardStats />)

        expect(screen.getByText('dashboard.stats.total_revenue')).toBeDefined()
        expect(screen.getByText('$10,000')).toBeDefined()
        expect(screen.getByText(/\+5% last month/)).toBeDefined()

        expect(screen.getByText('dashboard.stats.active_events')).toBeDefined()
        expect(screen.getByText('12')).toBeDefined()

        expect(screen.getByText('dashboard.stats.donations')).toBeDefined()
        expect(screen.getByText('150')).toBeDefined()

        expect(screen.getByText('dashboard.stats.staff_members')).toBeDefined()
        expect(screen.getByText('5')).toBeDefined()
    })
})
