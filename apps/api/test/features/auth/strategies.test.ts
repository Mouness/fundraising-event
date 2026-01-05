import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '@/features/auth/jwt.strategy';
import { GoogleStrategy } from '@/features/auth/google.strategy';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Strategies', () => {
  let jwtStrategy: JwtStrategy;
  let googleStrategy: GoogleStrategy;

  const mockConfigService = {
    get: vi.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'GOOGLE_CLIENT_ID') return 'client-id';
      if (key === 'GOOGLE_CLIENT_SECRET') return 'client-secret';
      if (key === 'GOOGLE_CALLBACK_URL') return 'callback-url';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        GoogleStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  describe('JwtStrategy', () => {
    it('should validate and return user payload', () => {
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'ADMIN',
      };
      const result = jwtStrategy.validate(payload);
      expect(result).toEqual({
        userId: 'user-id',
        email: 'test@example.com',
        role: 'ADMIN',
        eventId: undefined,
      });
    });
  });

  describe('GoogleStrategy', () => {
    it('should validate google profile', () => {
      const profile: Profile = {
        id: '123',
        displayName: 'Test User',
        name: { familyName: 'User', givenName: 'Test' },
        emails: [{ value: 'test@example.com', verified: true }],
        photos: [{ value: 'photo.jpg' }],
        provider: 'google',
        _raw: '',
        _json: {},
      } as any; // Cast to any to suppress strict type checking for mock

      const verifyCallback = vi.fn();

      googleStrategy.validate(
        'access-token',
        'refresh-token',
        profile as any,
        verifyCallback,
      );

      expect(verifyCallback).toHaveBeenCalledWith(null, {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        picture: 'photo.jpg',
        accessToken: 'access-token',
      });
    });

    it('should handle missing profile fields gracefully', () => {
      const profile: Profile = {
        id: '123',
        displayName: 'Test User',
        provider: 'google',
        _raw: '',
        _json: {},
      } as any;
      const verifyCallback = vi.fn();

      googleStrategy.validate(
        'access-token',
        'refresh-token',
        profile as any,
        verifyCallback,
      );

      expect(verifyCallback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          email: '',
          firstName: '',
          lastName: '',
        }),
      );
    });
  });
});
