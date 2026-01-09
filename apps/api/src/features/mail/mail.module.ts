import { Module, Global } from '@nestjs/common'
import { MailService } from './mail.service'
import { ConsoleMailProvider } from './providers/console-mail.provider'
import { NodemailerProvider } from './providers/nodemailer.provider'
import { ConfigService } from '@nestjs/config'
import { PdfModule } from '../pdf/pdf.module'
import { WhiteLabelingModule } from '../white-labeling/white-labeling.module'

@Global() // Make MailService available everywhere without importing MailModule
@Module({
    imports: [PdfModule, WhiteLabelingModule],
    providers: [MailService, ConsoleMailProvider, NodemailerProvider],
    exports: [MailService],
})
export class MailModule {}
