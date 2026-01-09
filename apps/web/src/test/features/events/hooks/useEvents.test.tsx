import { renderHook, waitFor } from '@testing-library/react'
import { useEvents } from '@features/events/hooks/useEvents'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock dependencies
vi.mock('@core/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
    VITE_API_URL: '/api',
    getApiErrorMessage: (_err: any, fallback: string) => fallback,
}))

import { api } from '@core/lib/api'

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('useEvents', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch events successfully', async () => {
        const mockEvents = [{ id: '1', name: 'Gala', slug: 'gala' }]
        ;(api.get as any).mockResolvedValue({ data: mockEvents })

        const { result } = renderHook(() => useEvents(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.events).toEqual(mockEvents)
        expect(api.get).toHaveBeenCalledWith('/events')
    })

    it('should handle errors', async () => {
        ;(api.get as any).mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useEvents(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.error).toBeTruthy()
        expect(result.current.events).toEqual([])
    })
})
