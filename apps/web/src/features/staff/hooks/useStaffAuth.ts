import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api, getApiErrorMessage } from '@core/lib/api'

interface StaffLoginCredentials {
    code: string
    eventId: string
}

interface StaffLoginResult {
    success: boolean
    error?: string
}

export interface StaffUser {
    id: string
    name: string
    role: 'STAFF'
    eventId: string
}

/**
 * Handles the staff login flow.
 * Manages staff token storage and navigation.
 */
export const useStaffAuth = () => {
    const navigate = useNavigate()
    const { slug } = useParams<{ slug: string }>()

    const mutation = useMutation({
        mutationFn: async (credentials: StaffLoginCredentials) => {
            const res = await api.post('/auth/staff/login', credentials)
            return res.data
        },
        onSuccess: (data) => {
            localStorage.setItem('staff_token', data.accessToken)
            localStorage.setItem('staff_user', JSON.stringify(data.user))
            if (slug) {
                navigate(`/${slug}/staff/collect`)
            }
        },
    })

    const login = async (code: string, eventId: string): Promise<StaffLoginResult> => {
        try {
            await mutation.mutateAsync({ code, eventId })
            return { success: true }
        } catch (err) {
            return { success: false, error: getApiErrorMessage(err, 'Login failed') }
        }
    }

    const logout = () => {
        localStorage.removeItem('staff_token')
        localStorage.removeItem('staff_user')
        if (slug) {
            navigate(`/${slug}/staff/login`)
        } else {
            navigate('/')
        }
    }

    const getStaffUser = (): StaffUser | null => {
        const user = localStorage.getItem('staff_user')
        return user ? JSON.parse(user) : null
    }

    const isStaffAuthenticated = (eventId?: string): boolean => {
        const token = localStorage.getItem('staff_token')
        if (!token) return false
        if (!eventId) return true
        const user = getStaffUser()
        return user?.eventId === eventId
    }

    return {
        login,
        logout,
        getStaffUser,
        isStaffAuthenticated,
        error: mutation.error ? getApiErrorMessage(mutation.error, 'Login failed') : null,
        isLoading: mutation.isPending,
    }
}
