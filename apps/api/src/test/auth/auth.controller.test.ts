import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '@/features/auth/auth.controller'
import { AuthService } from '@/features/auth/auth.service'
import { LoginDto, StaffLoginDto } from '@fundraising/types'
import { vi, describe, beforeEach, it, expect } from 'vitest'

describe('AuthController', () => {
    let controller: AuthController
    let authService: AuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        validateUser: vi.fn(),
                        validateStaff: vi.fn(),
                        login: vi.fn(),
                        loginStaff: vi.fn(),
                        validateGoogleUser: vi.fn(),
                    },
                },
            ],
        }).compile()

        controller = module.get<AuthController>(AuthController)
        authService = module.get<AuthService>(AuthService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('login', () => {
        it('should call validateUser and login', async () => {
            const loginDto: LoginDto = { email: 'admin@test.com', password: 'pass' }
            const user = { id: 'admin', email: 'admin@test.com' }

            ;(authService.validateUser as any).mockResolvedValue(user)
            ;(authService.login as any).mockReturnValue({
                accessToken: 'token',
                user,
            })

            const result = await controller.login(loginDto)

            expect(authService.validateUser).toHaveBeenCalledWith('admin@test.com', 'pass')
            expect(result).toEqual({ accessToken: 'token', user })
        })
    })

    describe('staffLogin', () => {
        it('should call validateStaff and loginStaff', async () => {
            const dto: StaffLoginDto = { code: '1234', eventId: 'evt_1' }
            const staff = { id: '1', name: 'John' }

            ;(authService.validateStaff as any).mockResolvedValue(staff)
            ;(authService.loginStaff as any).mockReturnValue({
                accessToken: 'token',
                user: staff,
            })

            const result = await controller.staffLogin(dto)

            expect(authService.validateStaff).toHaveBeenCalledWith('1234', 'evt_1')
            expect(result).toEqual({ accessToken: 'token', user: staff })
        })
    })

    describe('googleAuthRedirect', () => {
        it('should validate google user and redirect', async () => {
            const user = { id: 'admin', email: 'admin@test.com' }
            const req = { user: { email: 'admin@test.com' } }
            const res = { redirect: vi.fn() }

            ;(authService.validateGoogleUser as any).mockResolvedValue(user)
            ;(authService.login as any).mockReturnValue({
                accessToken: 'token',
                user,
            })

            await controller.googleAuthRedirect(req as any, res as any)
            expect(authService.validateGoogleUser).toHaveBeenCalledWith(req.user)
            expect(res.redirect).toHaveBeenCalledWith(
                expect.stringContaining('auth/success?token=token'),
            )
        })
    })
})
