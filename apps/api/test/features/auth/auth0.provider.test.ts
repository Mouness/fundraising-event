import { Test, TestingModule } from '@nestjs/testing'
import { Auth0Provider } from '@/features/auth/providers/auth0.provider'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { of, throwError } from 'rxjs'

describe('Auth0Provider', () => {
    let provider: Auth0Provider
    let httpService: HttpService

    const mockConfigService = {
        get: vi.fn((key: string) => {
            if (key === 'AUTH0_DOMAIN') return 'test-domain'
            if (key === 'AUTH0_CLIENT_ID') return 'test-id'
            if (key === 'AUTH0_CLIENT_SECRET') return 'test-secret'
            return null
        }),
    }

    const mockHttpService = {
        post: vi.fn(),
        get: vi.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Auth0Provider,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: HttpService, useValue: mockHttpService },
            ],
        }).compile()

        provider = module.get<Auth0Provider>(Auth0Provider)
        httpService = module.get<HttpService>(HttpService)

        // Mock Console
        vi.spyOn(console, 'error').mockImplementation(() => {})

        vi.clearAllMocks()
    })

    describe('verify', () => {
        it('should verify trusted external provider', async () => {
            const result = await provider.verify({
                isTrusted: true,
                email: 'test@example.com',
                sub: 'auth0|123',
                name: 'Test User',
            })

            expect(result).toEqual({
                id: 'auth0|123',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                picture: undefined,
            })
        })

        it('should verify email/password login', async () => {
            const mockTokenResponse = {
                data: { access_token: 'test-token' },
            }
            const mockUserResponse = {
                data: {
                    sub: 'auth0|123',
                    email: 'test@example.com',
                    name: 'Test User',
                    picture: 'pic.jpg',
                },
            }

            vi.mocked(httpService.post).mockReturnValue(of(mockTokenResponse) as any)
            vi.mocked(httpService.get).mockReturnValue(of(mockUserResponse) as any)

            const result = await provider.verify({
                email: 'test@example.com',
                password: 'password123',
            })

            expect(httpService.post).toHaveBeenCalled()
            expect(httpService.get).toHaveBeenCalled()
            expect(result).toEqual({
                id: 'auth0|123',
                email: 'test@example.com',
                role: 'USER',
                name: 'Test User',
                picture: 'pic.jpg',
            })
        })

        it('should return null on Auth0 post error', async () => {
            vi.mocked(httpService.post).mockReturnValue(throwError(() => new Error('API Error')))

            const result = await provider.verify({
                email: 'test@example.com',
                password: 'password123',
            })

            expect(result).toBeNull()
        })

        it('should return null on profile fetch error', async () => {
            const mockTokenResponse = {
                data: { access_token: 'test-token' },
            }
            vi.mocked(httpService.post).mockReturnValue(of(mockTokenResponse) as any)
            vi.mocked(httpService.get).mockReturnValue(throwError(() => new Error('Profile Error')))

            const result = await provider.verify({
                email: 'test@example.com',
                password: 'password123',
            })

            expect(result).toBeNull()
        })

        it('should return null if no credentials provided', async () => {
            const result = await provider.verify({})
            expect(result).toBeNull()
        })
    })
})
