import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthProvider } from '@/features/auth/providers/local.provider';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as argon2 from 'argon2';

vi.mock('argon2', () => ({
  verify: vi.fn(),
  hash: vi.fn(),
}));

describe('LocalAuthProvider', () => {
  let provider: LocalAuthProvider;

  const mockConfigService = {
    get: vi.fn((key: string) => {
      if (key === 'ADMIN_EMAIL') return 'admin@example.com';
      if (key === 'ADMIN_PASSWORD')
        return '$argon2id$v=19$m=65536,t=3,p=4$salt$hash';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAuthProvider,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    provider = module.get<LocalAuthProvider>(LocalAuthProvider);
    vi.clearAllMocks();
  });

  describe('verify', () => {
    it('should verify correct admin credentials', async () => {
      vi.mocked(argon2.verify).mockResolvedValue(true);

      const result = await provider.verify({
        email: 'admin@example.com',
        password: 'secure-pass',
      });

      expect(argon2.verify).toHaveBeenCalledWith(
        '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        'secure-pass',
      );
      expect(result).toEqual({
        id: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Administrator',
      });
    });

    it('should return null for incorrect admin credentials', async () => {
      vi.mocked(argon2.verify).mockResolvedValue(false);

      const result = await provider.verify({
        email: 'admin@example.com',
        password: 'wrong-pass',
      });
      expect(result).toBeNull();
    });

    it('should verify correct admin credentials via plain text', async () => {
      // Override mock for this specific test
      (mockConfigService.get.mockImplementation as any)((key: string) => {
        if (key === 'ADMIN_EMAIL') return 'admin@example.com';
        if (key === 'ADMIN_PASSWORD') return 'plain-text-secret';
        return null;
      });

      const result = await provider.verify({
        email: 'admin@example.com',
        password: 'plain-text-secret',
      });

      expect(result).toEqual({
        id: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Administrator',
      });

      // Reset mock
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAIL') return 'admin@example.com';
        if (key === 'ADMIN_PASSWORD')
          return '$argon2id$v=19$m=65536,t=3,p=4$salt$hash';
        return null;
      });
    });

    it('should verify trusted external user (Google) matching admin email', async () => {
      const result = await provider.verify({
        isTrusted: true,
        email: 'admin@example.com',
        name: 'Google User',
        picture: 'pic.jpg',
      });
      expect(result).toEqual({
        id: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Google User',
        picture: 'pic.jpg',
      });
    });

    it('should return null for trusted external user NOT matching admin email', async () => {
      const result = await provider.verify({
        isTrusted: true,
        email: 'other@example.com',
      });
      expect(result).toBeNull();
    });
  });
});
