import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { LoginDto } from '../src/dtos/login.dto';
import { StaffLoginDto } from '../src/dtos/staff-login.dto';

describe('LoginDto', () => {
    it('should validate valid login', async () => {
        const dto = new LoginDto();
        dto.email = 'test@example.com';
        dto.password = 'password123';
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail on invalid email', async () => {
        const dto = new LoginDto();
        dto.email = 'invalid-email';
        dto.password = 'password123';
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});

describe('StaffLoginDto', () => {
    it('should validate valid code', async () => {
        const dto = new StaffLoginDto();
        dto.code = '12345';
        dto.eventId = 'event-123';
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail on short code', async () => {
        const dto = new StaffLoginDto();
        dto.code = '123';
        dto.eventId = 'event-123';
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
