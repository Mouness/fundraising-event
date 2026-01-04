import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from '@/features/pdf/pdf.service';
import { EventConfigService } from '@/features/event/configuration/event-config.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Buffer } from 'buffer';

// Mock dependencies
const mockEventConfigService = {
  getConfig: vi.fn(),
};

// Mock PdfMake
const { mockCreatePdfKitDocument } = vi.hoisted(() => {
  return { mockCreatePdfKitDocument: vi.fn() };
});

vi.mock('pdfmake', () => {
  return {
    default: class MockPdfPrinter {
      constructor() {
        return {
          createPdfKitDocument: mockCreatePdfKitDocument,
        };
      }
    },
  };
});

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        { provide: EventConfigService, useValue: mockEventConfigService },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReceipt', () => {
    it('should generate PDF buffer', async () => {
      // Mock Config
      mockEventConfigService.getConfig.mockReturnValue({
        communication: {
          legalName: 'Org',
          address: '123 Test St',
          website: 'example.com',
          pdf: { enabled: true },
        },
        content: { title: 'Event' },
        theme: { variables: { '--primary': '#aabbcc' } },
      });

      // Mock PDF Stream
      const mockStream = {
        on: vi.fn((event, cb) => {
          if (event === 'data') cb(Buffer.from('pdf-chunk'));
          if (event === 'end') cb();
          return mockStream;
        }),
        end: vi.fn(),
      };
      mockCreatePdfKitDocument.mockReturnValue(mockStream);

      const buffer = await service.generateReceipt({
        amount: 1000,
        donorName: 'John',
        date: new Date(),
        transactionId: 'tx1',
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(mockCreatePdfKitDocument).toHaveBeenCalled();
    });
  });
});
