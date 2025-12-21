import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailProducer {
    constructor(@InjectQueue('email') private emailQueue: Queue) { }

    async sendReceipt(email: string, amount: number, transactionId: string) {
        await this.emailQueue.add('send-receipt', {
            email,
            amount,
            transactionId,
            date: new Date(),
        }, {
            attempts: 3, // Retry failed emails 3 times
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    }
}
