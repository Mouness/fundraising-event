import { Injectable, Logger } from '@nestjs/common';
import { MailProvider } from './mail-provider.interface';

@Injectable()
export class ConsoleMailProvider implements MailProvider {
    private readonly logger = new Logger(ConsoleMailProvider.name);

    async send(to: string, subject: string, template: string, context: any): Promise<void> {
        this.logger.log(`================ EMAIL SIMULATION ================`);
        this.logger.log(`TO: ${to}`);
        this.logger.log(`SUBJECT: ${subject}`);
        this.logger.log(`TEMPLATE: ${template}`);
        this.logger.log(`CONTEXT: ${JSON.stringify(context, null, 2)}`);
        this.logger.log(`==================================================`);
    }
}
