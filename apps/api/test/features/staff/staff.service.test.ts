import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { StaffService } from '../../../src/features/staff/staff.service'
import { PrismaService } from '../../../src/database/prisma.service'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

describe('StaffService', () => {
    let service: StaffService
    let prisma: PrismaService

    const mockPrismaService = {
        staffMember: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StaffService, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile()

        service = module.get<StaffService>(StaffService)
        prisma = module.get<PrismaService>(PrismaService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('findAll', () => {
        it('should return an array of staff members', async () => {
            const result = [{ id: '1', name: 'Test' }]
            vi.mocked(prisma.staffMember.findMany).mockResolvedValue(result as any)

            expect(await service.findAll()).toBe(result)
        })
    })

    describe('findOne', () => {
        it('should return a staff member if found', async () => {
            const result = { id: '1', name: 'Test' }
            vi.mocked(prisma.staffMember.findUnique).mockResolvedValue(result as any)

            expect(await service.findOne('1')).toBe(result)
        })

        it('should throw NotFoundException if not found', async () => {
            vi.mocked(prisma.staffMember.findUnique).mockResolvedValue(null)

            await expect(service.findOne('1')).rejects.toThrow(NotFoundException)
        })
    })

    describe('create', () => {
        it('should create a staff member', async () => {
            const dto = { name: 'New Staff', code: '1234', eventId: 'evt-1' }
            const result = { id: '1', ...dto }
            vi.mocked(prisma.staffMember.create).mockResolvedValue(result as any)

            expect(await service.create(dto)).toBe(result)
            expect(prisma.staffMember.create).toHaveBeenCalledWith({
                data: {
                    name: dto.name,
                    code: dto.code,
                    events: { connect: { id: dto.eventId } },
                },
            })
        })

        it('should throw ConflictException if PIN in use', async () => {
            const dto = { name: 'New Staff', code: '1234', eventId: 'evt-1' }
            const error = new Prisma.PrismaClientKnownRequestError('', {
                code: 'P2002',
                clientVersion: '2.0.0',
            })
            vi.mocked(prisma.staffMember.create).mockRejectedValue(error)

            await expect(service.create(dto)).rejects.toThrow(ConflictException)
        })
    })

    describe('update', () => {
        it('should update a staff member', async () => {
            const dto = { name: 'Updated Staff' }
            const result = { id: '1', ...dto }
            vi.mocked(prisma.staffMember.update).mockResolvedValue(result as any)

            expect(await service.update('1', dto)).toBe(result)
        })

        it('should throw ConflictException if PIN in use', async () => {
            const dto = { code: '1234' }
            const error = new Prisma.PrismaClientKnownRequestError('', {
                code: 'P2002',
                clientVersion: '2.0.0',
            })
            vi.mocked(prisma.staffMember.update).mockRejectedValue(error)

            await expect(service.update('1', dto)).rejects.toThrow(ConflictException)
        })
    })

    describe('remove', () => {
        it('should remove a staff member', async () => {
            vi.mocked(prisma.staffMember.delete).mockResolvedValue({
                id: '1',
            } as any)
            await service.remove('1')
            expect(prisma.staffMember.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            })
        })
    })
})
