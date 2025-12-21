import { Injectable, Inject } from '@nestjs/common';
import type { MailProvider } from './providers/mail-provider.interface';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MailService {
    constructor(
        @Inject('MAIL_PROVIDER') private readonly mailProvider: MailProvider,
        private readonly configService: ConfigService,
    ) { }

    async sendReceipt(to: string, data: any) {
        const subject = `Receipt for your donation of $${data.amount}`;

        const context = {
            ...data,
            eventName: this.configService.get('EVENT_NAME') || 'Fundraising Event',
            logoUrl: this.configService.get('EVENT_LOGO_URL') || '',
            primaryColor: this.configService.get('EVENT_PRIMARY_COLOR') || '#4f46e5',
            supportEmail: this.configService.get('SUPPORT_EMAIL') || 'support@example.com',
            year: new Date().getFullYear(),
            currency: 'USD', // TODO: Make dynamic
        };

        const template = await this.renderTemplate('receipt', context);

        await this.mailProvider.send(to, subject, template, context);
    }

    private async renderTemplate(templateName: string, context: any): Promise<string> {
        try {
            const templatePath = path.join(process.cwd(), 'src/features/mail/templates', `${templateName}.html`);
            // In production (dist), path might need adjustment or copy assets.
            // ideally use __dirname but NestJS structure varies. 
            // For now relying on src location for dev.

            let html = await fs.readFile(templatePath, 'utf-8');

            // Simple Mustache-like replacement
            Object.keys(context).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regex, String(context[key]));
            });

            return html;
        } catch (err) {
            console.warn(`Failed to load template ${templateName}:`, err);
            return 'Receipt content (Template error)';
        }
    }
}
