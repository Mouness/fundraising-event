import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '@/features/mail/mail.service';
import { ConsoleMailProvider } from '@/features/mail/providers/console-mail.provider';
import { NodemailerProvider } from '@/features/mail/providers/nodemailer.provider';
import { WhiteLabelingService } from '@/features/white-labeling/white-labeling.service';
import { PdfService } from '@/features/pdf/pdf.service';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';

// Mock fs
vi.mock('fs/promises');
const mockedFs = fs as unknown as { readFile: ReturnType<typeof vi.fn> };

const mockTemplate = `
<html>
    <style>
        .header { background-color: {{primaryColor}}; }
    </style>
    <body>
        <p>Hello {{donorName}}</p>
    </body>
</html>
`;

describe('MailService', () => {
  let service: MailService;
  let whiteLabelingService: WhiteLabelingService;
  let consoleMailProviderMock: { send: ReturnType<typeof vi.fn> };
  let nodemailerProviderMock: { send: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    consoleMailProviderMock = { send: vi.fn() };
    nodemailerProviderMock = { send: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConsoleMailProvider,
          useValue: consoleMailProviderMock,
        },
        {
          provide: NodemailerProvider,
          useValue: nodemailerProviderMock,
        },
        {
          provide: WhiteLabelingService,
          useValue: {
            getEventSettings: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return undefined;
            }),
          },
        },
        {
          provide: PdfService,
          useValue: {
            generateReceipt: vi.fn().mockResolvedValue(Buffer.from('pdf')),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    whiteLabelingService =
      module.get<WhiteLabelingService>(WhiteLabelingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send receipt with branding', async () => {
    const mockSettings = {
      content: { title: 'Test Event', goalAmount: 1000 },
      theme: {
        assets: { logo: '/logo.png' },
        variables: { '--primary': '#fff' },
      },
      communication: { email: { subjectLine: 'Test Subject' } },
      donation: {
        payment: { provider: 'stripe', currency: 'USD' },
        form: {
          phone: { enabled: false, required: false },
          address: { enabled: false, required: false },
          company: { enabled: false, required: false },
          message: { enabled: false, required: false },
          anonymous: { enabled: true, required: false },
        },
        sharing: { enabled: false, networks: [] },
      },
    };

    vi.spyOn(whiteLabelingService, 'getEventSettings').mockResolvedValue(
      mockSettings as any,
    );
    // Mock private renderTemplate if needed, or rely on it failing gracefully/working if template exists
    // Since renderTemplate is private and reads from FS, integration test might be better,
    // or we mock fs. But for now let's assume it logs warning if template missing.
    // Actually, renderTemplate is private. We can spy on 'send'

    await service.sendReceipt('test@example.com', {
      eventSlug: 'test-event',
      amount: 100,
      date: new Date(),
      transactionId: '123',
    });

    expect(whiteLabelingService.getEventSettings).toHaveBeenCalledWith(
      'test-event',
    );
    expect(consoleMailProviderMock.send).toHaveBeenCalled();
  });

  it('should render template with dynamic color and send email', async () => {
    // Mock template loading
    mockedFs.readFile.mockResolvedValue(mockTemplate);

    const mockSettings = {
      content: { title: 'Test Event' },
      theme: {
        assets: { logo: 'logo.png' },
        variables: { '--primary': 'blue' },
      },
      communication: {
        legalName: 'Org',
        address: 'Addr',
        website: 'web',
        email: { footerText: 'footer' },
      },
      donation: {
        payment: { provider: 'stripe', currency: 'USD' },
        form: {
          phone: { enabled: false, required: false },
          address: { enabled: false, required: false },
          company: { enabled: false, required: false },
          message: { enabled: false, required: false },
          anonymous: { enabled: true, required: false },
        },
        sharing: { enabled: false, networks: [] },
      },
    };
    vi.spyOn(whiteLabelingService, 'getEventSettings').mockResolvedValue(
      mockSettings as any,
    );

    const data = {
      eventSlug: 'test-event',
      donorName: 'John Doe',
      amount: 50,
      date: '2023-01-01',
      transactionId: '123',
      email: 'john@example.com',
    };

    await service.sendReceipt('john@example.com', data);

    // Verify FS load path (approximate check)
    expect(mockedFs.readFile).toHaveBeenCalled();

    // Verify MailProvider called
    expect(consoleMailProviderMock.send).toHaveBeenCalledTimes(1);

    const [to, subject, html] = consoleMailProviderMock.send.mock.calls[0];

    expect(to).toBe('john@example.com');
    expect(subject).toContain('Test Event');

    // CRITICAL CHECK: Did {{primaryColor}} get replaced by 'blue'?
    expect(html).toContain('background-color: blue');
    expect(html).toContain('Hello John Doe');
  });
});
