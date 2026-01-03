import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../../mail/mail.service';
import { Logger } from '@nestjs/common';

import { SendReceiptJobData } from '../interfaces/email-jobs.interface';

@Processor('email')
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly mailService: MailService) {
        super();
    }

    async process(job: Job<SendReceiptJobData, any, string>): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);

        switch (job.name) {
            case 'send-receipt':
                await this.handleSendReceipt(job.data);
                break;
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }

    private async handleSendReceipt(data: SendReceiptJobData) {
        await this.mailService.sendReceipt(data.email, data);
        this.logger.log(`Receipt email sent to ${data.email} for event ${data.eventSlug}`);
    }
}
