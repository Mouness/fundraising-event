import { Injectable, Inject } from '@nestjs/common';
import type { MailProvider } from './providers/mail-provider.interface';
import { EventConfigService } from '../events/configuration/event-config.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class MailService {
    constructor(
        @Inject('MAIL_PROVIDER') private readonly mailProvider: MailProvider,
        private readonly eventConfigService: EventConfigService,
        private readonly configService: ConfigService,
        private readonly pdfService: PdfService,
    ) { }

    async sendReceipt(to: string, data: any) {
        const config = this.eventConfigService.getConfig();
        const commConfig = config.communication;
        const subject = commConfig.email?.subjectLine || `Receipt for your donation of $${data.amount}`;

        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        const logoPath = config.theme?.assets?.logo || '';
        const absoluteLogoUrl = logoPath.startsWith('http') ? logoPath : `${frontendUrl}${logoPath}`;

        const context = {
            ...data,
            eventName: config.content.title,
            logoUrl: absoluteLogoUrl,
            primaryColor: await this.eventConfigService.getThemeVariable('--primary', '#ec4899'),
            legalName: commConfig.legalName,
            address: commConfig.address,
            website: commConfig.website,
            supportEmail: commConfig.supportEmail || 'support@example.com',
            footerText: commConfig.email?.footerText,
            year: new Date().getFullYear(),
            currency: 'USD',
        };

        // Generate PDF Receipt
        let attachments: { filename: string, content: Buffer }[] = [];
        try {
            const pdfBuffer = await this.pdfService.generateReceipt({
                amount: data.amount * 100, // Convert dollars to cents for PdfService
                donorName: data.name || data.donorName || 'Supporter', // Fallback
                date: new Date(data.date),
                transactionId: data.transactionId || 'N/A'
            });
            attachments.push({
                filename: `Receipt-${data.transactionId || 'donation'}.pdf`,
                content: pdfBuffer
            });
        } catch (error) {
            console.error('Failed to generate PDF receipt', error);
            // Continue sending email without attachment? Or fail? 
            // Better to log and continue so user at least gets the email.
        }

        const template = await this.renderTemplate('receipt', context);

        await this.mailProvider.send(to, subject, template, context, attachments);
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
