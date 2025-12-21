import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { EmailProducer } from './producers/email.producer';
import { EmailProcessor } from './processors/email.processor';
import { MailModule } from '../mail/mail.module';

@Global()
@Module({
    imports: [
        MailModule, // Queue processors need to send emails
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                connection: {
                    host: configService.get('REDIS_HOST') || 'localhost',
                    port: parseInt(configService.get('REDIS_PORT') || '6379'),
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'email',
        }),
    ],
    providers: [EmailProducer, EmailProcessor],
    exports: [EmailProducer, BullModule],
})
export class QueueModule { }
