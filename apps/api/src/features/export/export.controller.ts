
import { Controller, Get, Res, Logger } from '@nestjs/common';
import { ExportService } from './export.service';
import type { Response } from 'express';

@Controller('export')
export class ExportController {
    private readonly logger = new Logger(ExportController.name);

    constructor(private readonly exportService: ExportService) { }

    @Get('receipts/zip')
    // @UseGuards(AdminGuard) // TODO: Enable verification when Auth is fully set
    async downloadAllReceipts(@Res({ passthrough: true }) res: Response) {
        this.logger.log('Received request for Global Receipt Export');

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="receipts.zip"',
        });

        return this.exportService.exportReceipts();
    }
}
