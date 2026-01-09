import { Injectable, Logger } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import { WhiteLabelingService } from '../white-labeling/white-labeling.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ReceiptData, ReceiptContext } from '../mail/interfaces/receipt.interfaces';
import { getReceiptTemplate } from './templates/receipt.template';
import { I18nUtil } from '../../common/utils/i18n.util';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private printer: PdfPrinter;

  constructor(
    private readonly whiteLabelingService: WhiteLabelingService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const fontBase = path.join(process.cwd(), 'src/assets/fonts');

    const fonts = {
      Roboto: {
        normal: path.join(fontBase, 'Roboto-Regular.ttf'),
        bold: path.join(fontBase, 'Roboto-Bold.ttf'),
        italics: path.join(fontBase, 'Roboto-Regular.ttf'),
        bolditalics: path.join(fontBase, 'Roboto-Bold.ttf'),
      },
    };
    try {
      this.printer = new PdfPrinter(fonts);
    } catch (error) {
      this.logger.error('Failed to initialize PdfPrinter', error);
    }
  }

  // Overload 1: Convenience (Builds context then calls Overload 2)
  async generateReceipt(eventSlug: string, data: ReceiptData): Promise<Buffer>;
  // Overload 2: Efficient (Direct usage)
  async generateReceipt(context: ReceiptContext): Promise<Buffer>;

  async generateReceipt(arg1: string | ReceiptContext, arg2?: ReceiptData): Promise<Buffer> {
    const context = typeof arg1 === 'string'
      ? await this.buildContext(arg1, arg2!)
      : arg1 as ReceiptContext;

    return this.renderReceipt(context);
  }

  private async renderReceipt(context: ReceiptContext): Promise<Buffer> {
    // Fetch Images
    let logoImage: string | Buffer | null = null;
    let signatureImage: string | Buffer | null = null;
    try {
      if (context.logoUrl) logoImage = await this.fetchImage(context.logoUrl);
      if (context.signatureImage) signatureImage = await this.fetchImage(context.signatureImage as string);
    } catch (error) {
      this.logger.warn(`Failed to load images for PDF: ${error.message}`);
    }

    const docDefinition = getReceiptTemplate(context, { logo: logoImage, signature: signatureImage });

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition as any);
        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', (err) => reject(err));
        pdfDoc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private async buildContext(eventSlug: string, data: ReceiptData): Promise<ReceiptContext> {
    const eventConfig = await this.whiteLabelingService.getEventSettings(eventSlug);
    if (!eventConfig) throw new Error(`Event config not found for slug: ${eventSlug}`);

    const { communication: commConfig, theme, donation } = eventConfig;
    if (!commConfig?.pdf?.enabled) {
      this.logger.warn('Receipt generation requested but disabled in config');
    }

    const primaryColor = theme?.variables?.['--primary'] || '#000000';
    const currency = data.currency || donation.payment.currency || 'USD';
    const formattedDate = new Date(data.date || new Date()).toLocaleDateString();

    const locale = eventConfig.locales?.default || 'en';
    const localeData = I18nUtil.getEffectiveLocaleData(locale, eventConfig.locales?.overrides);

    return {
      ...data,
      eventName: eventConfig.content.title,
      logoUrl: theme?.assets?.logo || '',
      primaryColor,
      legalName: commConfig.legalName,
      taxId: commConfig.taxId,
      address: commConfig.address,
      website: commConfig.website,
      supportEmail: commConfig.supportEmail,
      phone: commConfig.phone,
      footerText: commConfig.footerText,
      signatureText: commConfig.signatureText,
      year: new Date().getFullYear(),
      currency,
      date: formattedDate,
      content: {
        title: I18nUtil.t(localeData, 'thankyou.receipt.title') === 'thankyou.receipt.title' ? 'Official Donation Receipt' : I18nUtil.t(localeData, 'thankyou.receipt.title'),
        receiptNumber: I18nUtil.t(localeData, 'thankyou.receipt.transaction_id'),
        date: I18nUtil.t(localeData, 'thankyou.receipt.date'),
        donorName: I18nUtil.t(localeData, 'thankyou.receipt.from'),
        amount: I18nUtil.t(localeData, 'donation.amount'),
        thankYou: I18nUtil.t(localeData, 'thankyou.receipt.message_body', { donorName: data.donorName || data.name || 'Supporter' }),
        authorizedSignature: I18nUtil.t(localeData, 'thankyou.receipt.authorized_signature'),
        footerTextDefault: I18nUtil.t(localeData, 'thankyou.receipt.pdf_attached'),
        taxIdLabel: I18nUtil.t(localeData, 'thankyou.receipt.tax_id_label'),
        websiteLabel: I18nUtil.t(localeData, 'thankyou.receipt.website_label'),
        visitWebsite: I18nUtil.t(localeData, 'thankyou.receipt.visit_website'),
      }
    };
  }

  private async fetchImage(url: string): Promise<Buffer> {
    // Resolve absolute URL if relative
    if (!url.startsWith('http')) {
      const frontendUrl =
        this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      url = `${frontendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, { responseType: 'arraybuffer' }),
      );
      return Buffer.from(data);
    } catch (error) {
      this.logger.error(`Error loading image from ${url}: ${error.message}`);
      throw error;
    }
  }
}
