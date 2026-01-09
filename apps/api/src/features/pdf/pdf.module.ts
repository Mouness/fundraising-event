import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { PdfService } from './pdf.service'
import { WhiteLabelingModule } from '../white-labeling/white-labeling.module'

@Module({
    imports: [WhiteLabelingModule, HttpModule],
    providers: [PdfService],
    exports: [PdfService],
})
export class PdfModule {}
