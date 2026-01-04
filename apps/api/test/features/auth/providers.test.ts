import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthProvider } from '@/features/auth/providers/local.provider';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('LocalAuthProvider', () => {
  let provider: LocalAuthProvider;

  const mockConfigService = {
    get: vi.fn((key: string) => {
      if (key === 'ADMIN_EMAIL') return 'admin@example.com';
      if (key === 'ADMIN_PASSWORD') return 'secure-pass-hash';
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
  });

  describe('verify', () => {
    it('should verify correct admin credentials', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      const result = await provider.verify({
        email: 'admin@example.com',
        password: 'secure-pass',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'secure-pass',
        'secure-pass-hash',
      );
      expect(result).toEqual({
        id: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        name: 'Administrator',
      });
    });

    it('should return null for incorrect admin credentials', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      const result = await provider.verify({
        email: 'admin@example.com',
        password: 'wrong-pass',
      });
      expect(result).toBeNull();
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
