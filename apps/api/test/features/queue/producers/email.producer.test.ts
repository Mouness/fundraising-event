import { Test, TestingModule } from '@nestjs/testing'
import { EmailProducer } from '@/features/queue/producers/email.producer'
import { getQueueToken } from '@nestjs/bullmq'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockQueue = {
    add: vi.fn(),
}

describe('EmailProducer', () => {
    let producer: EmailProducer

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailProducer, { provide: getQueueToken('email'), useValue: mockQueue }],
        }).compile()

        producer = module.get<EmailProducer>(EmailProducer)
        vi.clearAllMocks()
    })

    it('should be defined', () => {
        expect(producer).toBeDefined()
    })

    it('should add send-receipt job', async () => {
        await producer.sendReceipt('test@example.com', 100, 'tx_123', 'test-event')
        expect(mockQueue.add).toHaveBeenCalledWith(
            'send-receipt',
            expect.objectContaining({
                email: 'test@example.com',
                amount: 100,
                transactionId: 'tx_123',
                eventSlug: 'test-event',
            }),
            expect.any(Object),
        )
    })
})
