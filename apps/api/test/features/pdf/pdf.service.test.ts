import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from '@/features/pdf/pdf.service';
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Buffer } from 'buffer';

// Mock dependencies
const mockWhiteLabelingService = {
  getEventSettings: vi.fn(),
};

const mockConfigService = {
  get: vi.fn(),
};

const mockHttpService = {
  get: vi.fn(),
  post: vi.fn(),
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
        { provide: WhiteLabelingService, useValue: mockWhiteLabelingService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
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

      const buffer = await service.generateReceipt('slug', {
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
