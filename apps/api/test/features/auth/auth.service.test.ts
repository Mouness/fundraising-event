import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/features/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockJwtService = {
    sign: vi.fn(() => 'mock-token'),
};

const mockConfigService = {
    get: vi.fn(),
};

const mockPrismaService = {
    staffCode: {
        findUnique: vi.fn(),
    },
};

const mockAuthProvider = {
    verify: vi.fn(),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: 'AUTH_PROVIDER', useValue: mockAuthProvider },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateStaff', () => {
        it('should return staff provided valid code', async () => {
            mockPrismaService.staffCode.findUnique.mockResolvedValue({
                id: 'staff-1',
                name: 'John',
                code: '1234',
                eventId: 'event-1',
            });

            const result = await service.validateStaff('1234');
            expect(result).toEqual({
                id: 'staff-1',
                name: 'John',
                role: 'STAFF',
                eventId: 'event-1',
            });
        });

        it('should return null for invalid code', async () => {
            mockPrismaService.staffCode.findUnique.mockResolvedValue(null);
            const result = await service.validateStaff('wrong');
            expect(result).toBeNull();
        });
    });

    describe('loginStaff', () => {
        it('should return access token', async () => {
            const staffVal = { id: 's1', name: 'S', role: 'STAFF', eventId: 'e1' };
            const result = await service.loginStaff(staffVal);
            expect(result.accessToken).toBe('mock-token');
            expect(result.user.role).toBe('STAFF');
        });
    });
});
