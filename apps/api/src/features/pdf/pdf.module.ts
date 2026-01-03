
import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { WhiteLabelingModule } from '../white-labeling/white-labeling.module';

@Module({
    imports: [WhiteLabelingModule],
    providers: [PdfService],
    exports: [PdfService],
})
export class PdfModule { }
