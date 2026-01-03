import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/features/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(() => 'test_token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key) => {
              if (key === 'ADMIN_EMAIL') return 'admin@example.com';
              if (key === 'ADMIN_PASSWORD') return 'password';
              return null;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            staffCode: {
              findUnique: vi.fn(),
            },
          },
        },
        {
          provide: 'AUTH_PROVIDER',
          useValue: {
            verify: vi.fn((credentials) => {
              // Mock logic for local provider behavior
              if (credentials.isTrusted) {
                // Google login scenario
                if (credentials.email === 'admin@example.com') {
                  return {
                    id: 'admin',
                    email: credentials.email,
                    role: 'ADMIN',
                    name: credentials.name,
                  };
                }
                return null;
              }
              // Password login
              if (
                credentials.email === 'admin@example.com' &&
                credentials.password === 'password'
              ) {
                return {
                  id: 'admin',
                  email: 'admin@example.com',
                  role: 'ADMIN',
                };
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object if credentials valid', async () => {
      const result = await service.validateUser(
        'admin@example.com',
        'password',
      );
      expect(result).toEqual({
        id: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      });
    });

    it('should return null if credentials invalid', async () => {
      const result = await service.validateUser('admin@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('validateStaff', () => {
    it('should return staff object if code valid', async () => {
      const mockStaff = {
        id: '1',
        name: 'John',
        code: '1234',
        eventId: 'evt_1',
      };
      // Note: vitest uses vi.mocked or similar, but with useValue we can just cast or access mock
      // However, typical jest.Mock usage is:
      (prismaService.staffCode.findUnique as any).mockResolvedValue(mockStaff);

      const result = await service.validateStaff('1234');
      expect(result).toEqual({
        id: '1',
        name: 'John',
        role: 'STAFF',
        eventId: 'evt_1',
      });
    });

    it('should return null if code invalid', async () => {
      (prismaService.staffCode.findUnique as any).mockResolvedValue(null);
      const result = await service.validateStaff('0000');
      expect(result).toBeNull();
    });
  });

  describe('validateGoogleUser', () => {
    it('should return user if email matches admin', async () => {
      const profile = {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
      };
      const result = await service.validateGoogleUser(profile);
      expect(result).toEqual({
        id: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Admin User',
      });
    });

    it('should return null if email does not match', async () => {
      const profile = {
        email: 'hacker@example.com',
        firstName: 'Bad',
        lastName: 'Actor',
      };
      const result = await service.validateGoogleUser(profile);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const user = { id: 'admin', email: 'admin@example.com', role: 'ADMIN' };
      const result = await service.login(user);
      expect(result).toEqual({
        accessToken: 'test_token',
        user: { id: 'admin', email: 'admin@example.com', role: 'ADMIN' },
      });
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
