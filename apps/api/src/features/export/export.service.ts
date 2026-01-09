import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import archiver from 'archiver';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { PdfService } from '../pdf/pdf.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
  ) {}

  async exportReceipts(eventId?: string): Promise<StreamableFile> {
    this.logger.log(
      `Starting global receipt export for event: ${eventId || 'ALL'}...`,
    );

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Best compression
    });

    const where: Prisma.DonationWhereInput = { status: 'COMPLETED' };
    if (eventId) where.eventId = eventId;

    const donations = await this.prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { event: { select: { slug: true } } },
    });

    this.logger.log(`Found ${donations.length} donations to process.`);

    // Error handling for the archive
    archive.on('error', (err) => {
      this.logger.error('Archiver error', err);
      throw err;
    });

    // We process sequentially for MVP to avoid memory spikes with parallel PDF generation
    // A better approach for HUGE datasets would be a dedicated worker.
    for (const donation of donations) {
      try {
        // For tax receipts, we always use the real name, even if the donation is anonymous publicly.
        const donorName = donation.donorName || 'Supporter';

        if (!donation.event?.slug) {
          this.logger.warn(
            `Skipping receipt for donation ${donation.id}: Event slug not found`,
          );
          continue;
        }

        const pdfBuffer = await this.pdfService.generateReceipt(
          donation.event.slug,
          {
            amount: donation.amount.toNumber(), // Convert Decimal to number (cents)
            donorName: donorName,
            date: donation.createdAt,
            transactionId: donation.id, // or donation.transactionId (stripe ID)
          },
        );

        archive.append(pdfBuffer, { name: `Receipt-${donation.id}.pdf` });
      } catch (error) {
        this.logger.error(
          `Failed to generate PDF for donation ${donation.id}`,
          error,
        );
        // We append a text file with error log instead of failing the whole export
        archive.append(`Error generating receipt: ${error.message}`, {
          name: `ERROR-${donation.id}.txt`,
        });
      }
    }

    archive.finalize();

    return new StreamableFile(archive);
  }

  async getReceipt(donationId: string): Promise<Buffer> {
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
      include: { event: { select: { slug: true } } },
    });

    if (!donation) {
      throw new Error('Donation not found');
    }

    if (!donation.event?.slug) {
      throw new Error('Event context missing for donation');
    }

    const donorName = donation.donorName || 'Supporter';

    return this.pdfService.generateReceipt(donation.event.slug, {
      amount: donation.amount.toNumber(),
      donorName: donorName,
      date: donation.createdAt,
      transactionId: donation.id,
    });
  }
}
