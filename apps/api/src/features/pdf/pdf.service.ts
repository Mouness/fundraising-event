import { Injectable, Logger } from '@nestjs/common';
import PdfPrinter from 'pdfmake';
import * as path from 'path';
import { WhiteLabelingService } from '../white-labeling/white-labeling.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private printer: PdfPrinter;

  constructor(
    private readonly whiteLabelingService: WhiteLabelingService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Resolve fonts ensuring correct path whether running from root or apps/api
    // But commonly pnpm -r runs in package CWD.
    // Also handling dist vs src for robustness if possible, but keeping it simple for dev first.
    const fontBase = path.join(process.cwd(), 'src/assets/fonts');

    const fonts = {
      Roboto: {
        normal: path.join(fontBase, 'Roboto-Regular.ttf'),
        bold: path.join(fontBase, 'Roboto-Bold.ttf'),
        italics: path.join(fontBase, 'Roboto-Regular.ttf'), // Fallback
        bolditalics: path.join(fontBase, 'Roboto-Bold.ttf'), // Fallback
      },
    };
    try {
      this.printer = new PdfPrinter(fonts);
    } catch (error) {
      this.logger.error('Failed to initialize PdfPrinter', error);
    }
  }

  async generateReceipt(
    eventSlug: string,
    data: {
      amount: number;
      donorName: string;
      date: Date;
      transactionId: string;
    },
  ): Promise<Buffer> {
    // Resolve Config
    const eventConfig =
      await this.whiteLabelingService.getEventSettings(eventSlug);

    if (!eventConfig) {
      throw new Error(`Event config not found for slug: ${eventSlug}`);
    }

    const { communication: commConfig, theme } = eventConfig;

    if (!commConfig?.pdf?.enabled) {
      this.logger.warn('Receipt generation requested but disabled in config');
    }

    const primaryColor = theme?.variables?.['--primary'] || '#000000';

    let logoImage: string | Buffer | null = null;
    try {
      const logoPath = theme?.assets?.logo;
      if (logoPath) {
        logoImage = await this.fetchImage(logoPath);
      }
    } catch (error) {
      this.logger.warn(`Failed to load logo for PDF: ${error.message}`);
    }

    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const docDefinition = {
      content: [
        logoImage
          ? {
              image: logoImage,
              width: 100,
              alignment: 'center',
              margin: [0, 0, 0, 10],
            }
          : {},
        {
          text: eventConfig.content.title.toUpperCase(),
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        {
          text: 'OFFICIAL DONATION RECEIPT',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 40],
        },

        {
          style: 'tableExample',
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Organization Details', style: 'tableHeader' },
                { text: 'Donation Details', style: 'tableHeader' },
              ],
              [
                {
                  text: [
                    {
                      text: commConfig.legalName || 'Organization Details',
                      bold: true,
                    },
                    '\n',
                    commConfig.address || 'Organization Address',
                    '\n',
                    {
                      text: commConfig.website || '',
                      italics: true,
                      color: 'blue',
                      decoration: 'underline',
                    },
                  ],
                  margin: [0, 10, 0, 10],
                },
                {
                  text: [
                    { text: 'Date: ', bold: true },
                    formattedDate,
                    '\n',
                    { text: 'Receipt #: ', bold: true },
                    data.transactionId.substring(0, 8).toUpperCase(),
                    '\n',
                    { text: 'Amount: ', bold: true },
                    `$${(data.amount / 100).toFixed(2)}`,
                  ],
                  margin: [0, 10, 0, 10],
                },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 40],
        },

        {
          text: 'Donor Information',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        },
        {
          text: [{ text: 'Name: ', bold: true }, data.donorName, '\n'],
          margin: [0, 0, 0, 20],
        },

        {
          text: 'Thank you for your support!',
          style: 'highlight',
          alignment: 'center',
          margin: [0, 20],
        },

        {
          text:
            commConfig.pdf?.footerText ||
            'This is a computer-generated receipt.',
          style: 'footer',
          alignment: 'center',
          margin: [0, 50, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: primaryColor,
        },
        subheader: {
          fontSize: 16,
          bold: true,
          color: '#7f8c8d',
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#2c3e50',
          decoration: 'underline',
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: primaryColor,
          fillColor: '#f8f9fa',
        },
        highlight: {
          fontSize: 14,
          bold: true,
          italics: true,
          color: '#27ae60',
        },
        footer: {
          fontSize: 10,
          color: '#95a5a6',
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', (err) =>
          reject(err instanceof Error ? err : new Error(String(err))),
        );
        pdfDoc.end();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
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
