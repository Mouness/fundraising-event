import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '@/features/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: vi.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true if no roles are required', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
        const context = createMockContext();
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if there is no user', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
        const context = createMockContext(null);
        expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true if user has required role', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
        const context = createMockContext({ role: 'admin' });
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if user does not have required role', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
        const context = createMockContext({ role: 'user' });
        expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true if user has one of multiple required roles', () => {
        vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'staff']);
        const context = createMockContext({ role: 'staff' });
        expect(guard.canActivate(context)).toBe(true);
    });
});

const createMockContext = (user: any = null): ExecutionContext => {
    return {
        getHandler: vi.fn(),
        getClass: vi.fn(),
        switchToHttp: () => ({
            getRequest: () => ({
                user,
            }),
        }),
    } as unknown as ExecutionContext;
}
