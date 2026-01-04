import { Injectable, Inject, Logger } from '@nestjs/common';
import type { MailProvider } from './providers/mail-provider.interface';
import { WhiteLabelingService } from '../white-labeling/white-labeling.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject('MAIL_PROVIDER') private readonly mailProvider: MailProvider,
    private readonly whiteLabelingService: WhiteLabelingService,
    private readonly configService: ConfigService,
    private readonly pdfService: PdfService,
  ) { }

  async sendReceipt(to: string, data: any) {
    // data MUST contain eventSlug. If not, we can't label correctly.
    const eventSlug = data.eventSlug;
    if (!eventSlug) {
      this.logger.error(
        'Missing eventSlug in sendReceipt data. Cannot send branded receipt.',
      );
      return;
    }

    const config = await this.whiteLabelingService.getEventSettings(eventSlug);
    if (!config) {
      this.logger.error(`Event config not found for slug: ${eventSlug}`);
      return;
    }

    const { communication: commConfig, theme } = config;
    const subject =
      commConfig.email?.subjectLine ||
      `Receipt for your donation of $${data.amount}`;

    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:5173';

    // Resolve absolute logo URL
    let absoluteLogoUrl = '';
    const logoPath = theme?.assets?.logo;
    if (logoPath) {
      absoluteLogoUrl = logoPath.startsWith('http')
        ? logoPath
        : `${frontendUrl}${logoPath}`;
    }

    const primaryColor = theme?.variables?.['--primary'] || '#000000';

    const context = {
      ...data,
      eventName: config.content.title,
      logoUrl: absoluteLogoUrl,
      primaryColor: primaryColor,
      legalName: commConfig.legalName,
      address: commConfig.address,
      website: commConfig.website,
      supportEmail: commConfig.supportEmail || 'support@example.com',
      footerText: commConfig.email?.footerText,
      year: new Date().getFullYear(),
      currency: config.donation.payment.currency || 'USD',
    };

    // Generate PDF Receipt
    const attachments: { filename: string; content: Buffer }[] = [];
    try {
      const pdfBuffer = await this.pdfService.generateReceipt(eventSlug, {
        amount: data.amount * 100, // Convert dollars to cents for PdfService
        donorName: data.name || data.donorName || 'Supporter', // Fallback
        date: new Date(data.date),
        transactionId: data.transactionId || 'N/A',
      });
      attachments.push({
        filename: `Receipt-${data.transactionId || 'donation'}.pdf`,
        content: pdfBuffer,
      });
    } catch (error) {
      console.error('Failed to generate PDF receipt', error);
      // Continue sending email without attachment? Or fail?
      // Better to log and continue so user at least gets the email.
    }

    const template = await this.renderTemplate('receipt', context);

    await this.mailProvider.send(to, subject, template, context, attachments);
  }

  private async renderTemplate(
    templateName: string,
    context: any,
  ): Promise<string> {
    try {
      const templatePath = path.join(
        process.cwd(),
        'src/features/mail/templates',
        `${templateName}.html`,
      );
      // In production (dist), path might need adjustment or copy assets.
      // ideally use __dirname but NestJS structure varies.
      // For now relying on src location for dev.

      let html = await fs.readFile(templatePath, 'utf-8');

      // Simple Mustache-like replacement
      Object.keys(context).forEach((key) => {
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
