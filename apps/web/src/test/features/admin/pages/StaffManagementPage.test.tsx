import { useState } from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StaffManagementPage } from '@/features/admin/pages/StaffManagementPage'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { api } from '@core/lib/api'
import { toast } from 'sonner'

vi.mock('@core/lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { retry: false, gcTime: 0 },
                },
            }),
    )
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('StaffManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders loading and empty state', async () => {
        ;(api.get as any).mockResolvedValue({ data: [] })
        // Start with loading
        let resolveQuery: any
        const promise = new Promise((resolve) => {
            resolveQuery = resolve
        })
        ;(api.get as any).mockReturnValueOnce(promise)

        render(<StaffManagementPage />, { wrapper: Wrapper })
        expect(screen.getByText('admin_team.loading_staff')).toBeDefined()

        resolveQuery({ data: [] })
        await waitFor(() => expect(screen.queryByText('admin_team.loading_staff')).toBeNull())
        expect(screen.getByText('admin_team.no_staff_found')).toBeDefined()
    })

    it('renders staff list', async () => {
        ;(api.get as any).mockResolvedValue({
            data: [{ id: '1', name: 'John Doe', code: '1234', _count: { events: 2 } }],
        })

        render(<StaffManagementPage />, { wrapper: Wrapper })

        await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined())
        expect(screen.getByText('1234')).toBeDefined()
        expect(screen.getByText('admin_team.events_count')).toBeDefined()
    })

    it('allows adding a staff member', async () => {
        const user = userEvent.setup()
        ;(api.get as any).mockResolvedValue({ data: [] })
        ;(api.post as any).mockResolvedValue({ data: { id: '2' } })

        render(<StaffManagementPage />, { wrapper: Wrapper })

        const addBtn = screen.getByText('admin_team.add_member')
        await user.click(addBtn)

        // Wait for dialog content to be available
        await screen.findByRole('dialog')

        fireEvent.change(screen.getByLabelText('admin_team.member_name'), {
            target: { value: 'New Staff' },
        })
        fireEvent.change(screen.getByLabelText('admin_team.pin_code'), {
            target: { value: '5555' },
        })

        const dialog = await screen.findByRole('dialog')
        const submitBtn = within(dialog).getByRole('button', {
            name: 'admin_team.add_member',
        }) // Dialog footer button
        await user.click(submitBtn)

        await waitFor(() =>
            expect(api.post).toHaveBeenCalledWith('/staff', {
                name: 'New Staff',
                code: '5555',
            }),
        )
        expect(toast.success).toHaveBeenCalledWith('admin_team.member_created')
    })

    it('allows editing a staff member', async () => {
        const user = userEvent.setup()
        const staffMember = {
            id: '1',
            name: 'John Doe',
            code: '1234',
            _count: { events: 0 },
        }
        ;(api.get as any).mockResolvedValue({ data: [staffMember] })
        ;(api.put as any).mockResolvedValue({
            data: { ...staffMember, name: 'John Updated' },
        })

        render(<StaffManagementPage />, { wrapper: Wrapper })

        await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined())

        const editBtn = screen
            .getAllByRole('button')
            .find((b) => b.querySelector('.lucide-square-pen')) // lucide-edit is square-pen now
        if (editBtn) await user.click(editBtn)

        await screen.findByRole('dialog')

        const dialog = await screen.findByRole('dialog')
        fireEvent.change(within(dialog).getByLabelText('admin_team.member_name'), {
            target: { value: 'John Updated' },
        })
        const saveBtn = within(dialog).getByText('admin_team.save_changes')
        await user.click(saveBtn)

        await waitFor(() =>
            expect(api.put).toHaveBeenCalledWith('/staff/1', {
                name: 'John Updated',
                code: '1234',
            }),
        )
        expect(toast.success).toHaveBeenCalledWith('admin_team.member_updated')
    })

    it('allows deleting a staff member', async () => {
        const user = userEvent.setup()
        ;(api.get as any).mockResolvedValue({
            data: [{ id: '1', name: 'John Doe', code: '1234' }],
        })
        ;(api.delete as any).mockResolvedValue({ data: { success: true } })

        render(<StaffManagementPage />, { wrapper: Wrapper })

        await waitFor(() => expect(screen.getByText('John Doe')).toBeDefined())

        const deleteBtn = screen
            .getAllByRole('button')
            .find((b) => b.querySelector('.lucide-trash-2'))
        if (deleteBtn) await user.click(deleteBtn)

        const confirmBtn = await screen.findByText('common.delete')
        await user.click(confirmBtn)

        await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/staff/1'))
        expect(toast.success).toHaveBeenCalledWith('admin_team.member_deleted')
    })
})
