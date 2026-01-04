import {
  Controller,
  Get,
  Res,
  Logger,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ExportService } from './export.service';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('export')
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  @Get('receipts/zip')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async downloadAllReceipts(
    @Res({ passthrough: true }) res: Response,
    @Query('eventId') eventId?: string,
  ) {
    this.logger.log(
      `Received request for Global Receipt Export. Event: ${eventId || 'ALL'}`,
    );

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="receipts-${eventId || 'global'}.zip"`,
    });

    return this.exportService.exportReceipts(eventId);
  }

  @Get('receipts/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async downloadSingleReceipt(@Param('id') id: string, @Res() res: Response) {
    this.logger.log(`Received request for single receipt download: ${id}`);

    try {
      const buffer = await this.exportService.getReceipt(id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${id}.pdf"`,
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    } catch (error) {
      this.logger.error(`Failed to download receipt ${id}`, error);
      res.status(404).send({ message: 'Receipt not found' });
    }
  }
}
