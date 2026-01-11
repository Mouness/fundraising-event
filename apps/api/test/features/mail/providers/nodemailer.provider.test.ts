import { Test, TestingModule } from '@nestjs/testing'
import { NodemailerProvider } from '../../../../src/features/mail/providers/nodemailer.provider'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('nodemailer')

describe('NodemailerProvider', () => {
    let provider: NodemailerProvider
    let configService: ConfigService
    let sendMailMock: any
    let verifyMock: any

    beforeEach(async () => {
        sendMailMock = vi.fn().mockResolvedValue({ messageId: '123' })
        verifyMock = vi.fn().mockResolvedValue(true)
        ;(nodemailer.createTransport as any).mockReturnValue({
            sendMail: sendMailMock,
            verify: verifyMock,
        })

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NodemailerProvider,
                {
                    provide: ConfigService,
                    useValue: {
                        get: vi.fn((key: string) => {
                            if (key === 'SMTP_HOST') return 'smtp.example.com'
                            if (key === 'SMTP_PORT') return 587
                            if (key === 'SMTP_USER') return 'user'
                            if (key === 'SMTP_PASS') return 'pass'
                            if (key === 'SMTP_FROM') return 'noreply@example.com'
                            return null
                        }),
                    },
                },
            ],
        }).compile()

        provider = module.get<NodemailerProvider>(NodemailerProvider)
        configService = module.get<ConfigService>(ConfigService)

        // Mock Logger
        vi.spyOn((provider as any).logger, 'error').mockImplementation(() => {})
    })

    it('should be defined', () => {
        expect(provider).toBeDefined()
    })

    it('should create transporter and send email', async () => {
        await provider.send('to@example.com', 'Subject', 'Body', {})

        expect(nodemailer.createTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                host: 'smtp.example.com',
                port: 587,
            }),
        )
        expect(sendMailMock).toHaveBeenCalledWith(
            expect.objectContaining({
                to: 'to@example.com',
                subject: 'Subject',
                html: 'Body',
            }),
        )
    })

    it('should throw error if SMTP host is missing', async () => {
        vi.spyOn(configService, 'get').mockReturnValue(null)
        await expect(provider.send('to', 'sub', 'body', {})).rejects.toThrow(
            'SMTP configuration missing',
        )
    })
})
