
import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import archiver from 'archiver';
import { PrismaService } from '../../database/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { Readable } from 'stream';

@Injectable()
export class ExportService {
    private readonly logger = new Logger(ExportService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly pdfService: PdfService,
    ) { }

    async exportReceipts(eventId?: string): Promise<StreamableFile> {
        this.logger.log(`Starting global receipt export for event: ${eventId || 'ALL'}...`);

        const archive = archiver('zip', {
            zlib: { level: 9 }, // Best compression
        });

        const where: any = { status: 'COMPLETED' };
        if (eventId) where.eventId = eventId;

        const donations = await this.prisma.donation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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
                // Determine donor name (anonymous check or fallback)
                let donorName = donation.donorName || 'Supporter';
                if (donation.isAnonymous) {
                    // Keep real name for internal tax records? Or anonymize?
                    // Usually for TAX RECEIPTS you need the REAL name even if anonymous publicly.
                    // Assuming 'donorName' field holds the real name entered in form.
                }

                const pdfBuffer = await this.pdfService.generateReceipt({
                    amount: donation.amount.toNumber(), // Convert Decimal to number (cents)
                    donorName: donorName,
                    date: donation.createdAt,
                    transactionId: donation.id, // or donation.transactionId (stripe ID)
                });

                archive.append(pdfBuffer, { name: `Receipt-${donation.id}.pdf` });

            } catch (error) {
                this.logger.error(`Failed to generate PDF for donation ${donation.id}`, error);
                // We append a text file with error log instead of failing the whole export
                archive.append(`Error generating receipt: ${error.message}`, { name: `ERROR-${donation.id}.txt` });
            }
        }

        archive.finalize();

        return new StreamableFile(archive);
    }

    async getReceipt(donationId: string): Promise<Buffer> {
        const donation = await this.prisma.donation.findUnique({
            where: { id: donationId },
        });

        if (!donation) {
            throw new Error('Donation not found');
        }

        const donorName = donation.donorName || 'Supporter';

        return this.pdfService.generateReceipt({
            amount: donation.amount.toNumber(),
            donorName: donorName,
            date: donation.createdAt,
            transactionId: donation.id,
        });
    }
}
