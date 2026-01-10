import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '@/features/auth/auth.controller'
import { AuthService } from '@/features/auth/auth.service'
import { UnauthorizedException } from '@nestjs/common'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAuthService = {
    validateUser: vi.fn(),
    login: vi.fn(),
    validateStaff: vi.fn(),
    loginStaff: vi.fn(),
    validateGoogleUser: vi.fn(),
}

describe('AuthController', () => {
    let controller: AuthController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }],
        }).compile()

        controller = module.get<AuthController>(AuthController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('login', () => {
        it('should return token on success', async () => {
            mockAuthService.validateUser.mockResolvedValue({
                id: '1',
                email: 'test',
                role: 'ADMIN',
            })
            mockAuthService.login.mockReturnValue({ accessToken: 'a', user: {} })

            const result = await controller.login({ email: 'test', password: 'p' })
            expect(result).toBeDefined()
        })

        it('should throw Unauthorized on fail', async () => {
            mockAuthService.validateUser.mockResolvedValue(null)
            await expect(controller.login({ email: 't', password: 'p' })).rejects.toThrow(
                UnauthorizedException,
            )
        })
    })

    describe('staffLogin', () => {
        it('should return token on success', async () => {
            mockAuthService.validateStaff.mockResolvedValue({
                id: 's1',
                role: 'STAFF',
            })
            mockAuthService.loginStaff.mockReturnValue({
                accessToken: 'a',
                user: {},
            })

            const result = await controller.staffLogin({
                code: '1234',
                eventId: 'e1',
            })
            expect(result).toBeDefined()
        })

        it('should throw Unauthorized on fail', async () => {
            mockAuthService.validateStaff.mockResolvedValue(null)
            await expect(controller.staffLogin({ code: 'wrong', eventId: 'e1' })).rejects.toThrow(
                UnauthorizedException,
            )
        })
    })

    describe('googleAuthRedirect', () => {
        it('should redirect on success', async () => {
            mockAuthService.validateGoogleUser.mockResolvedValue({
                id: 'g1',
                email: 'g@test.com',
            })
            mockAuthService.login.mockReturnValue({ accessToken: 'g', user: {} })

            const req = { user: { email: 'g@test.com' } }
            const res = { redirect: vi.fn() }

            await controller.googleAuthRedirect(req as any, res as any)
            expect(res.redirect).toHaveBeenCalled()
        })

        it('should throw Unauthorized if user not validated', async () => {
            mockAuthService.validateGoogleUser.mockResolvedValue(null)
            const req = { user: { email: 'fails' } }
            const res = { redirect: vi.fn() }

            await expect(controller.googleAuthRedirect(req as any, res as any)).rejects.toThrow(
                UnauthorizedException,
            )
        })
    })
})
