import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConsoleMailProvider } from './providers/console-mail.provider';
import { ConfigService } from '@nestjs/config';

@Global() // Make MailService available everywhere without importing MailModule
@Module({
    providers: [
        MailService,
        ConsoleMailProvider,
        {
            provide: 'MAIL_PROVIDER',
            useFactory: (config: ConfigService, consoleProvider: ConsoleMailProvider) => {
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
export class MailModule { }
