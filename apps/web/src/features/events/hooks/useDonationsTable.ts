import { useState } from 'react'
import { api } from '@core/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@core/hooks/use-debounce'

export interface DonationTableData {
    id: string
    donorName: string
    donorEmail: string
    amount: number
    currency: string
    status: string
    createdAt: string
    paymentMethod: string
    isAnonymous: boolean
    staffMember?: {
        id: string
        name: string
        code: string
    }
}

interface DonationsResponse {
    data: DonationTableData[]
    total: number
}

export const useDonationsTable = (eventId: string) => {
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState<string>('all')

    // In a real app, you would debounce the search input
    const debouncedSearch = useDebounce(search, 500)

    const offset = (page - 1) * limit

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['donations-table', eventId, page, limit, debouncedSearch, status],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (eventId) params.append('eventId', eventId)
            params.append('limit', limit.toString())
            params.append('offset', offset.toString())
            if (debouncedSearch) params.append('search', debouncedSearch)
            if (status && status !== 'all') params.append('status', status)

            const response = await api.get<DonationsResponse>(`/donations?${params.toString()}`)
            return response.data
        },
    })

    return {
        donations: data?.data || [],
        total: data?.total || 0,
        pageCount: data ? Math.ceil(data.total / limit) : 0,
        isLoading,
        page,
        setPage,
        search,
        setSearch,
        status,
        setStatus,
        refetch,
    }
}
