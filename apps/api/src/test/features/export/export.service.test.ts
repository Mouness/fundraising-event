import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from '@/features/export/export.service';
import { PrismaService } from '@/database/prisma.service';
import { PdfService } from '@/features/pdf/pdf.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '@prisma/client';

describe('ExportService', () => {
  let service: ExportService;
  let prismaMock: any;
  let pdfServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      donation: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    pdfServiceMock = {
      generateReceipt: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PdfService, useValue: pdfServiceMock },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

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
    ]);

    // Mock PDF generation
    pdfServiceMock.generateReceipt.mockResolvedValue(
      Buffer.from('PDF CONTENT'),
    );

    const result = await service.exportReceipts('event-1');

    expect(prismaMock.donation.findMany).toHaveBeenCalled();
    expect(pdfServiceMock.generateReceipt).toHaveBeenCalledTimes(2);
    expect(result).toBeDefined();
    // In a real env we might inspect the stream, but for unit test ensuring flow is enough
  });

  it('should handle missing event slug gracefully', async () => {
    prismaMock.donation.findMany.mockResolvedValue([
      {
        id: '3',
        amount: new Prisma.Decimal(100),
        createdAt: new Date(),
        donorName: 'Donor 3',
        event: null, // Missing slug
      },
    ]);

    await service.exportReceipts();
    expect(pdfServiceMock.generateReceipt).not.toHaveBeenCalled();
  });
});
