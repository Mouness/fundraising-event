import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { StaffController } from '../../../src/features/staff/staff.controller'
import { StaffService } from '../../../src/features/staff/staff.service'

describe('StaffController', () => {
    let controller: StaffController
    let service: StaffService

    const mockStaffService = {
        findAll: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StaffController],
            providers: [
                {
                    provide: StaffService,
                    useValue: mockStaffService,
                },
            ],
        }).compile()

        controller = module.get<StaffController>(StaffController)
        service = module.get<StaffService>(StaffService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('findAll', () => {
        it('should return array of staff', async () => {
            const result = [{ id: '1', name: 'Test' }]
            vi.mocked(service.findAll).mockResolvedValue(result as any)
            expect(await controller.findAll()).toBe(result)
        })
    })

    describe('findOne', () => {
        it('should return a staff member', async () => {
            const result = { id: '1', name: 'Test' }
            vi.mocked(service.findOne).mockResolvedValue(result as any)
            expect(await controller.findOne('1')).toBe(result)
        })
    })

    describe('create', () => {
        it('should create staff', async () => {
            const dto = { name: 'Test', code: '1234', eventId: 'evt-1' }
            const result = { id: '1', ...dto }
            vi.mocked(service.create).mockResolvedValue(result as any)
            expect(await controller.create(dto)).toBe(result)
        })
    })

    describe('update', () => {
        it('should update staff', async () => {
            const dto = { name: 'Updated' }
            const result = { id: '1', ...dto }
            vi.mocked(service.update).mockResolvedValue(result as any)
            expect(await controller.update('1', dto)).toBe(result)
        })
    })

    describe('remove', () => {
        it('should remove staff', async () => {
            vi.mocked(service.remove).mockResolvedValue({ id: '1' } as any)
            await controller.remove('1')
            expect(service.remove).toHaveBeenCalledWith('1')
        })
    })
})
