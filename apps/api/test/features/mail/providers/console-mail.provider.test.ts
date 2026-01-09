import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleMailProvider } from '../../../../src/features/mail/providers/console-mail.provider';
import { Logger } from '@nestjs/common';

describe('ConsoleMailProvider', () => {
    let provider: ConsoleMailProvider;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConsoleMailProvider],
        }).compile();

        provider = module.get<ConsoleMailProvider>(ConsoleMailProvider);
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });

    it('should log email details to console', async () => {
        const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => { });

        await provider.send(
            'test@example.com',
            'Test Subject',
            '<p>Hello</p>',
            { name: 'User' },
            [{ filename: 'test.txt', content: Buffer.from('content') }]
        );

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('EMAIL SIMULATION'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TO: test@example.com'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('SUBJECT: Test Subject'));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ATTACHMENTS: 1 file(s)'));
    });
});
