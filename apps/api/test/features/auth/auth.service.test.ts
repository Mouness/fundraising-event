/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
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

const mockPrismaService: any = {
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
      // Mocking partial Prisma client
      mockPrismaService.staffMember = {
        findUnique: vi.fn(),
      };

      mockPrismaService.staffMember.findUnique.mockResolvedValue({
        id: 'staff-1',
        name: 'John',
        code: '1234',
        events: [{ id: 'event-1', slug: 'event-slug' }],
      });

      const result = await service.validateStaff('1234', 'event-1');
      expect(result).toEqual({
        id: 'staff-1',
        name: 'John',
        role: 'STAFF',
        eventId: 'event-1',
      });
    });

    it('should return null for invalid code', async () => {
      if (!mockPrismaService.staffMember) {
        mockPrismaService.staffMember = { findUnique: vi.fn() };
      }
      mockPrismaService.staffMember.findUnique.mockResolvedValue(null);
      const result = await service.validateStaff('wrong', 'event-1');
      expect(result).toBeNull();
    });
  });

  describe('loginStaff', () => {
    it('should return access token', () => {
      const staffVal: any = {
        id: 's1',
        name: 'S',
        role: 'STAFF',
        eventId: 'e1',
      };
      const result = service.loginStaff(staffVal);
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.role).toBe('STAFF');
    });
  });

  describe('login', () => {
    it('should return access token for admin', () => {
      const user: any = { id: 'a1', email: 'admin@test.com', role: 'ADMIN' };
      const result = service.login(user);
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.role).toBe('ADMIN');
    });
  });

  describe('validateGoogleUser', () => {
    it('should call authProvider verify', async () => {
      mockAuthProvider.verify.mockResolvedValue({
        id: 'g1',
        email: 'g@test.com',
      });
      const result = await service.validateGoogleUser({
        email: 'g@test.com',
        firstName: 'G',
        lastName: 'User',
      });
      expect(mockAuthProvider.verify).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'g@test.com',
          isTrusted: true,
        }),
      );
      expect(result).toEqual({ id: 'g1', email: 'g@test.com' });
    });
  });
});
