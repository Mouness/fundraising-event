import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '@/features/mail/mail.service';
import { EventConfigService } from '@/features/event/configuration/event-config.service';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

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
    let mailProviderMock: { send: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        mailProviderMock = { send: vi.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                {
                    provide: 'MAIL_PROVIDER',
                    useValue: mailProviderMock,
                },
                {
                    provide: EventConfigService,
                    useValue: {
                        getConfig: () => ({
                            content: { title: 'Test Event' },
                            theme: { logoUrl: 'logo.png' }
                        }),
                        getThemeVariable: vi.fn().mockResolvedValue('blue'),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string) => (key === 'FRONTEND_URL' ? 'http://localhost:3000' : null),
                    },
                },
            ],
        }).compile();

        service = module.get<MailService>(MailService);
    });

    it('should render template with dynamic color and send email', async () => {
        // Mock template loading
        mockedFs.readFile.mockResolvedValue(mockTemplate);

        const data = {
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
        expect(mailProviderMock.send).toHaveBeenCalledTimes(1);

        const [to, subject, html, context] = mailProviderMock.send.mock.calls[0];

        expect(to).toBe('john@example.com');
        expect(subject).toContain('$50');

        // CRITICAL CHECK: Did {{primaryColor}} get replaced by 'blue'?
        expect(html).toContain('background-color: blue');
        expect(html).toContain('Hello John Doe');
    });
});
