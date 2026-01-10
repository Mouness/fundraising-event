import { describe, it, expect } from 'vitest'
import { validate } from 'class-validator'
import { CreateDonationDto } from '../src/dtos/create-donation.dto'
import { OfflineDonationDto } from '../src/dtos/offline-donation.dto'

describe('CreateDonationDto', () => {
    it('should validate valid dto', async () => {
        const dto = new CreateDonationDto()
        dto.amount = 100
        dto.currency = 'USD'
        const errors = await validate(dto)
        expect(errors.length).toBe(0)
    })

    it('should fail if amount is missing', async () => {
        const dto = new CreateDonationDto()
        const errors = await validate(dto)
        expect(errors.length).toBeGreaterThan(0)
    })

    it('should fail if amount is negative', async () => {
        const dto = new CreateDonationDto()
        dto.amount = -5
        const errors = await validate(dto)
        expect(errors.length).toBeGreaterThan(0)
    })
})

describe('OfflineDonationDto', () => {
    it('should validate valid offline donation', async () => {
        const dto = new OfflineDonationDto()
        dto.amount = 50
        dto.type = 'cash'
        const errors = await validate(dto)
        expect(errors.length).toBe(0)
    })

    it('should fail if type is missing', async () => {
        const dto = new OfflineDonationDto()
        dto.amount = 50
        const errors = await validate(dto)
        expect(errors.length).toBeGreaterThan(0)
    })
})
