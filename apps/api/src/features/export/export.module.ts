import { Module } from '@nestjs/common'
import { ExportController } from './export.controller'
import { ExportService } from './export.service'
import { DatabaseModule } from '../../database/database.module' // Adjust path
import { PdfModule } from '../pdf/pdf.module'

@Module({
    imports: [DatabaseModule, PdfModule],
    controllers: [ExportController],
    providers: [ExportService],
})
export class ExportModule {}
