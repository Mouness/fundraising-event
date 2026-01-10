import { Test, TestingModule } from '@nestjs/testing'
import { EmailProcessor } from '@/features/queue/processors/email.processor'
import { MailService } from '@/features/mail/mail.service'
import { Job } from 'bullmq'
import { vi, describe, beforeEach, it, expect } from 'vitest'
import { Logger } from '@nestjs/common'

describe('EmailProcessor', () => {
    let processor: EmailProcessor
    let mailService: MailService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailProcessor,
                {
                    provide: MailService,
                    useValue: {
                        sendReceipt: vi.fn(),
                    },
                },
            ],
        }).compile()

        processor = module.get<EmailProcessor>(EmailProcessor)
        mailService = module.get<MailService>(MailService)
    })

    it('should be defined', () => {
        expect(processor).toBeDefined()
    })

    describe('process', () => {
        it('should handle send-receipt job', async () => {
            const data = {
                email: 'test@example.com',
                eventSlug: 'test-event',
                amount: 100,
            }
            const job = {
                id: '1',
                name: 'send-receipt',
                data,
            } as Job

            await processor.process(job)

            expect(mailService.sendReceipt).toHaveBeenCalledWith(data.email, data)
        })

        it('should log warning for unknown job name', async () => {
            const warnSpy = vi.spyOn(Logger.prototype, 'warn')
            const job = {
                id: '1',
                name: 'unknown-job',
                data: {},
            } as Job

            await processor.process(job)

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Unknown job name: unknown-job'),
            )
        })
    })
})
