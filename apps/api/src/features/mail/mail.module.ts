import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConsoleMailProvider } from './providers/console-mail.provider';
import { ConfigService } from '@nestjs/config';
import { PdfModule } from '../pdf/pdf.module';
import { WhiteLabelingModule } from '../white-labeling/white-labeling.module';

@Global() // Make MailService available everywhere without importing MailModule
@Module({
  imports: [PdfModule, WhiteLabelingModule],
  providers: [
    MailService,
    ConsoleMailProvider,
    {
      provide: 'MAIL_PROVIDER',
      useFactory: (
        config: ConfigService,
        consoleProvider: ConsoleMailProvider,
      ) => {
        // Here we can switch implementation based on ENV
        // const provider = config.get('MAIL_PROVIDER');
        // if (provider === 'resend') return new ResendProvider(...)
        return consoleProvider;
      },
      inject: [ConfigService, ConsoleMailProvider],
    },
  ],
  exports: [MailService],
})
export class MailModule {}
