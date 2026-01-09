import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import '@/core/lib/zod-i18n'

// Using global i18next mock from setup.ts
// Global mock returns key if no count, else "key count"

describe('zod-i18n', () => {
    it('should translate required field error', () => {
        const schema = z.string()
        const result = schema.safeParse(undefined)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.required')
        }
    })

    it('should translate too_small error', () => {
        const schema = z.string().min(5)
        const result = schema.safeParse('abc')
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.too_small.string 5')
        }
    })

    it('should translate too_big error', () => {
        const schema = z.string().max(2)
        const result = schema.safeParse('abc')
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.too_big.string 2')
        }
    })

    it('should translate invalid_type error', () => {
        const schema = z.string()
        const result = schema.safeParse(123)
        if (!result.success) {
            // Global mock just returns the key for invalid_type as it has no 'count'
            expect(result.error.issues[0].message).toBe('validation.invalid_type')
        }
    })

    it('should translate invalid_string error', () => {
        const schema = z.string().email()
        const result = schema.safeParse('not-an-email')
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.invalid_string.email')
        }
    })

    it('should translate invalid_date error', () => {
        const schema = z.date()
        const result = schema.safeParse(new Date('invalid'))
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.invalid_date')
        }
    })

    it('should translate not_multiple_of error', () => {
        const schema = z.number().multipleOf(5)
        const result = schema.safeParse(3)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.not_multiple_of')
        }
    })

    it('should translate not_finite error', () => {
        const schema = z.number().finite()
        const result = schema.safeParse(Infinity)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.not_finite')
        }
    })

    it('should translate custom error', () => {
        const schema = z.string().superRefine((_val, ctx) => {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
            })
        })
        const result = schema.safeParse('abc')
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.custom')
        }
    })

    it('should translate invalid_enum_value error', () => {
        const schema = z.enum(['A', 'B'])
        const result = schema.safeParse('C')
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('validation.invalid_enum_value')
        }
    })
})
