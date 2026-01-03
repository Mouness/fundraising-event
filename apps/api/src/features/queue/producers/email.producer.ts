import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { SendReceiptJobData } from '../interfaces/email-jobs.interface';

@Injectable()
export class EmailProducer {
    constructor(@InjectQueue('email') private emailQueue: Queue) { }

    async sendReceipt(email: string, amount: number, transactionId: string, eventSlug: string) {
        const jobData: SendReceiptJobData = {
            email,
            amount,
            transactionId,
            eventSlug,
            date: new Date(),
        };
        await this.emailQueue.add('send-receipt', jobData, {
            attempts: 3, // Retry failed emails 3 times
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    }
}
