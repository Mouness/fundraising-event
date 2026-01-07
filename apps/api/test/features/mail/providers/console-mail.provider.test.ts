import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleMailProvider } from '@/features/mail/providers/console-mail.provider';
import { describe, beforeEach, it, expect, vi } from 'vitest';
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

    it('should log email simulation without attachments', async () => {
        const logSpy = vi.spyOn(Logger.prototype, 'log');

        await provider.send(
            'test@example.com',
            'Test Subject',
            'test-template',
            { name: 'John' }
        );

        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('EMAIL SIMULATION'));
        expect(logSpy).toHaveBeenCalledWith('TO: test@example.com');
        expect(logSpy).toHaveBeenCalledWith('SUBJECT: Test Subject');
        expect(logSpy).toHaveBeenCalledWith('TEMPLATE: test-template');
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('"name": "John"'));
    });

    it('should log email simulation with attachments', async () => {
        const logSpy = vi.spyOn(Logger.prototype, 'log');

        await provider.send(
            'test@example.com',
            'Test Subject',
            'test-template',
            { name: 'John' },
            [{ filename: 'test.pdf', content: Buffer.from('PDF CONTENT') }]
        );

        expect(logSpy).toHaveBeenCalledWith('ATTACHMENTS: 1 file(s)');
        expect(logSpy).toHaveBeenCalledWith(' - test.pdf (11 bytes)');
    });
});
