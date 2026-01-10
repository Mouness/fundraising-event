import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
    useRequest: vi.fn(),
    useResponse: vi.fn(),
}))

vi.mock('axios', async (importOriginal) => {
    const actual: any = await importOriginal()
    return {
        ...actual,
        default: {
            ...actual.default,
            create: vi.fn(() => ({
                interceptors: {
                    request: { use: mocks.useRequest },
                    response: { use: mocks.useResponse },
                },
                defaults: { headers: { common: {} } },
            })),
            isAxiosError: vi.fn((obj) => obj && obj.isAxiosError === true),
        },
    }
})

// Import api to trigger interceptor registration
import '@/core/lib/api'
import { getApiErrorMessage } from '@/core/lib/api'
import { STORAGE_KEYS } from '@/core/lib/constants'

// Capture the interceptors before clearing mocks
const requestInterceptor = mocks.useRequest.mock.calls[0]?.[0]
const responseSuccessInterceptor = mocks.useResponse.mock.calls[0]?.[0]
const responseErrorInterceptor = mocks.useResponse.mock.calls[0]?.[1]

describe('api lib', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
        vi.stubGlobal('location', {
            pathname: '/',
            href: 'http://localhost/',
        })
        vi.stubGlobal('window', {
            location: {
                pathname: '/',
                href: 'http://localhost/',
            },
        })
    })

    describe('interceptors registration', () => {
        it('should have captured interceptors', () => {
            expect(requestInterceptor).toBeDefined()
            expect(responseErrorInterceptor).toBeDefined()
        })
    })

    describe('request interceptor', () => {
        it('should add Authorization header if token exists', () => {
            localStorage.setItem(STORAGE_KEYS.TOKEN, 'test-token')

            const config = { headers: {} }
            const result = requestInterceptor(config)

            expect(result.headers.Authorization).toBe('Bearer test-token')
        })

        it('should add Authorization header if staff token exists', () => {
            localStorage.setItem(STORAGE_KEYS.STAFF_TOKEN, 'staff-token')

            const config = { headers: {} }
            const result = requestInterceptor(config)

            expect(result.headers.Authorization).toBe('Bearer staff-token')
        })

        it('should do nothing if no tokens exist', () => {
            const config = { headers: {} }
            const result = requestInterceptor(config)
            expect(result.headers.Authorization).toBeUndefined()
        })
    })

    describe('response interceptor', () => {
        it('should pass through success response', () => {
            const response = { data: 'ok' }
            expect(responseSuccessInterceptor(response)).toBe(response)
        })

        it('should handle 401 and redirect to login', () => {
            const error = {
                response: { status: 401 },
                config: {},
            }

            responseErrorInterceptor(error).catch(() => {})
            expect(window.location.href).toBe('/login')
        })

        it('should handle 401 on staff path and redirect to staff login', () => {
            // @ts-ignore
            window.location.pathname = '/evt-slug/staff/dashboard'

            const error = {
                response: { status: 401 },
                config: {},
            }

            responseErrorInterceptor(error).catch(() => {})
            expect(window.location.href).toBe('/evt-slug/staff/login')
        })

        it('should handle 401 on staff path without slug and redirect to root', () => {
            // @ts-ignore
            window.location.pathname = '/staff/dashboard'

            const error = {
                response: { status: 401 },
                config: {},
            }

            responseErrorInterceptor(error).catch(() => {})
            expect(window.location.href).toBe('/')
        })
    })

    describe('getApiErrorMessage', () => {
        it('should extract message from axios error', () => {
            const error = {
                isAxiosError: true,
                response: { data: { message: 'Custom Error' } },
            }
            expect(getApiErrorMessage(error)).toBe('Custom Error')
        })

        it('should use fallback message for non-axios error', () => {
            expect(getApiErrorMessage({}, 'Fallback')).toBe('Fallback')
        })

        it('should use error message if no response data', () => {
            const error = {
                isAxiosError: true,
                message: 'Network Error',
            }
            expect(getApiErrorMessage(error)).toBe('Network Error')
        })

        it('should use error message for general Error instance', () => {
            const error = new Error('Generic Error')
            expect(getApiErrorMessage(error)).toBe('Generic Error')
        })
    })
})
