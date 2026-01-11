import { Test, TestingModule } from '@nestjs/testing'
import { PdfService } from '@/features/pdf/pdf.service'
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { of } from 'rxjs'
import { Buffer } from 'buffer'

// Mock dependencies
const mockWhiteLabelingService = {
    getEventSettings: vi.fn(),
}

const mockConfigService = {
    get: vi.fn(),
}

const mockHttpService = {
    get: vi.fn(),
    post: vi.fn(),
}

// Mock PdfMake
const { mockCreatePdfKitDocument } = vi.hoisted(() => {
    return { mockCreatePdfKitDocument: vi.fn() }
})

vi.mock('pdfmake', () => {
    return {
        default: class MockPdfPrinter {
            constructor() {
                // Return the instance shape expected by the service
            }
            createPdfKitDocument = mockCreatePdfKitDocument
        },
    }
})

describe('PdfService', () => {
    let service: PdfService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PdfService,
                { provide: WhiteLabelingService, useValue: mockWhiteLabelingService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: HttpService, useValue: mockHttpService },
            ],
        }).compile()

        service = module.get<PdfService>(PdfService)

        // Mock Logger
        vi.spyOn((service as any).logger, 'error').mockImplementation(() => {})

        vi.clearAllMocks()
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('generateReceipt', () => {
        it('should generate PDF buffer', async () => {
            // Mock Config
            mockWhiteLabelingService.getEventSettings.mockResolvedValue({
                id: 'evt_1', // Added required fields
                slug: 'slug',
                communication: {
                    legalName: 'Org',
                    address: '123 Test St',
                    website: 'example.com',
                    pdf: { enabled: true },
                },
                content: { title: 'Event' },
                theme: { variables: { '--primary': '#aabbcc' } },
                donation: { payment: { currency: 'USD' } },
            })

            // Mock PDF Stream
            const mockStream = {
                on: vi.fn((event, cb) => {
                    if (event === 'data') cb(Buffer.from('pdf-chunk'))
                    if (event === 'end') cb()
                    return mockStream
                }),
                end: vi.fn(),
            }
            mockCreatePdfKitDocument.mockReturnValue(mockStream)

            const buffer = await service.generateReceipt('slug', {
                amount: 1000,
                donorName: 'John',
                date: new Date(),
                transactionId: 'tx1',
            })

            expect(buffer).toBeInstanceOf(Buffer)
            expect(mockCreatePdfKitDocument).toHaveBeenCalled()
        })

        it('should throw if event config not found', async () => {
            mockWhiteLabelingService.getEventSettings.mockResolvedValue(null)
            await expect(
                service.generateReceipt('missing', {
                    amount: 1000,
                    donorName: 'John',
                    date: new Date(),
                    transactionId: 'tx1',
                }),
            ).rejects.toThrow('Event config not found')
        })

        it('should handle image fetching success', async () => {
            mockWhiteLabelingService.getEventSettings.mockResolvedValue({
                id: 'evt_1',
                slug: 'slug',
                communication: { pdf: { enabled: true } },
                content: { title: 'Event' },
                theme: { assets: { logo: 'http://example.com/logo.png' } },
                donation: { payment: { currency: 'USD' } },
            })

            mockHttpService.get.mockReturnValue(of({ data: Buffer.from('logo') }))
            const mockStream = {
                on: vi.fn((event, cb) => {
                    if (event === 'data') cb(Buffer.from('pdf'))
                    if (event === 'end') cb()
                    return mockStream
                }),
                end: vi.fn(),
            }
            mockCreatePdfKitDocument.mockReturnValue(mockStream)

            await service.generateReceipt('slug', {
                amount: 1000,
                donorName: 'John',
                date: new Date(),
                transactionId: 'tx1',
            })

            expect(mockHttpService.get).toHaveBeenCalledWith(
                'http://example.com/logo.png',
                expect.any(Object),
            )
        })

        it('should handle image fetching failure', async () => {
            mockWhiteLabelingService.getEventSettings.mockResolvedValue({
                id: 'evt_1',
                slug: 'slug',
                communication: { pdf: { enabled: true } },
                content: { title: 'Event' },
                theme: { assets: { logo: '/logo.png' } },
                donation: { payment: { currency: 'USD' } },
            })

            mockConfigService.get.mockReturnValue('http://frontend.com')
            mockHttpService.get.mockImplementation(() => {
                throw new Error('Fetch Error')
            })

            const mockStream = {
                on: vi.fn((event, cb) => {
                    if (event === 'data') cb(Buffer.from('pdf'))
                    if (event === 'end') cb()
                    return mockStream
                }),
                end: vi.fn(),
            }
            mockCreatePdfKitDocument.mockReturnValue(mockStream)

            await service.generateReceipt('slug', {
                amount: 1000,
                donorName: 'John',
                date: new Date(),
                transactionId: 'tx1',
            })

            // Should not throw, just log warn and continue
        })

        it('should handle PDF stream error', async () => {
            mockWhiteLabelingService.getEventSettings.mockResolvedValue({
                id: 'evt_1',
                slug: 'slug',
                communication: { pdf: { enabled: true } },
                content: { title: 'Event' },
                donation: { payment: { currency: 'USD' } },
            })

            const mockStream = {
                on: vi.fn((event, cb) => {
                    if (event === 'error') cb(new Error('Stream Error'))
                    return mockStream
                }),
                end: vi.fn(),
            }
            mockCreatePdfKitDocument.mockReturnValue(mockStream)

            await expect(
                service.generateReceipt('slug', {
                    amount: 1000,
                    donorName: 'John',
                    date: new Date(),
                    transactionId: 'tx1',
                }),
            ).rejects.toThrow('Stream Error')
        })
    })
})
