import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/features/auth/auth.controller';
import { AuthService } from '@/features/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthService = {
    validateUser: vi.fn(),
    login: vi.fn(),
    validateStaff: vi.fn(),
    loginStaff: vi.fn(),
};

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return token on success', async () => {
            mockAuthService.validateUser.mockResolvedValue({ id: '1', email: 'test', role: 'ADMIN' });
            mockAuthService.login.mockReturnValue({ accessToken: 'a', user: {} });

            const result = await controller.login({ email: 'test', password: 'p' });
            expect(result).toBeDefined();
        });

        it('should throw Unauthorized on fail', async () => {
            mockAuthService.validateUser.mockResolvedValue(null);
            await expect(controller.login({ email: 't', password: 'p' })).rejects.toThrow(UnauthorizedException);
        });
    });
});
