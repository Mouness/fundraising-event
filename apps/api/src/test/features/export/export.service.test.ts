import { Test, TestingModule } from '@nestjs/testing'
import { ExportService } from '@/features/export/export.service'
import { PrismaService } from '@/database/prisma.service'
import { PdfService } from '@/features/pdf/pdf.service'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@prisma/client'

describe('ExportService', () => {
    let service: ExportService
    let prismaMock: any
    let pdfServiceMock: any

    beforeEach(async () => {
        prismaMock = {
            donation: {
                findMany: vi.fn(),
                findUnique: vi.fn(),
            },
        }

        pdfServiceMock = {
            generateReceipt: vi.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExportService,
                { provide: PrismaService, useValue: prismaMock },
                { provide: PdfService, useValue: pdfServiceMock },
            ],
        }).compile()

        service = module.get<ExportService>(ExportService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    it('should export receipts as zip', async () => {
        // Mock donations
        prismaMock.donation.findMany.mockResolvedValue([
            {
                id: '1',
                amount: new Prisma.Decimal(100),
                createdAt: new Date(),
                donorName: 'Donor 1',
                isAnonymous: false,
                event: { slug: 'event-1' },
            },
            {
                id: '2',
                amount: new Prisma.Decimal(50),
                createdAt: new Date(),
                donorName: 'Donor 2',
                isAnonymous: false,
                event: { slug: 'event-1' },
            },
        ])

        // Mock PDF generation
        pdfServiceMock.generateReceipt.mockResolvedValue(Buffer.from('PDF CONTENT'))

        const result = await service.exportReceipts('event-1')

        expect(prismaMock.donation.findMany).toHaveBeenCalled()
        expect(pdfServiceMock.generateReceipt).toHaveBeenCalledTimes(2)
        expect(result).toBeDefined()
        // In a real env we might inspect the stream, but for unit test ensuring flow is enough
    })

    it('should handle missing event slug gracefully', async () => {
        prismaMock.donation.findMany.mockResolvedValue([
            {
                id: '3',
                amount: new Prisma.Decimal(100),
                createdAt: new Date(),
                donorName: 'Donor 3',
                event: null, // Missing slug
            },
        ])

        await service.exportReceipts()
        expect(pdfServiceMock.generateReceipt).not.toHaveBeenCalled()
    })

    it('should handle PDF generation error gracefully', async () => {
        prismaMock.donation.findMany.mockResolvedValue([
            {
                id: '4',
                amount: new Prisma.Decimal(100),
                createdAt: new Date(),
                donorName: 'Donor 4',
                event: { slug: 'event-1' },
            },
        ])

        pdfServiceMock.generateReceipt.mockRejectedValue(new Error('PDF ERROR'))

        const result = await service.exportReceipts()
        expect(result).toBeDefined()
        // Flow should complete even with error
    })

    describe('getReceipt', () => {
        it('should return PDF buffer for individual receipt', async () => {
            const mockDonation = {
                id: '1',
                amount: new Prisma.Decimal(100),
                createdAt: new Date(),
                donorName: 'Donor 1',
                event: { slug: 'event-1' },
            }
            prismaMock.donation.findUnique.mockResolvedValue(mockDonation)
            pdfServiceMock.generateReceipt.mockResolvedValue(Buffer.from('PDF'))

            const result = await service.getReceipt('1')
            expect(result).toEqual(Buffer.from('PDF'))
            expect(pdfServiceMock.generateReceipt).toHaveBeenCalledWith('event-1', {
                amount: 100,
                donorName: 'Donor 1',
                date: mockDonation.createdAt,
                transactionId: '1',
            })
        })

        it('should throw if donation not found', async () => {
            prismaMock.donation.findUnique.mockResolvedValue(null)
            await expect(service.getReceipt('999')).rejects.toThrow('Donation not found')
        })

        it('should throw if event context is missing', async () => {
            prismaMock.donation.findUnique.mockResolvedValue({
                id: '1',
                event: null,
            })
            await expect(service.getReceipt('1')).rejects.toThrow('Event context missing')
        })

        it('should use default donor name if missing', async () => {
            const mockDonation = {
                id: '1',
                amount: new Prisma.Decimal(100),
                createdAt: new Date(),
                donorName: null,
                event: { slug: 'event-1' },
            }
            prismaMock.donation.findUnique.mockResolvedValue(mockDonation)
            pdfServiceMock.generateReceipt.mockResolvedValue(Buffer.from('PDF'))

            await service.getReceipt('1')
            expect(pdfServiceMock.generateReceipt).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ donorName: 'Supporter' }),
            )
        })
    })
})
