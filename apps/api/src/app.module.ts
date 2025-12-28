import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './features/event/event.module';
import { GatewayModule } from './features/gateway/gateway.module';
import { DatabaseModule } from './database/database.module';
import { DonationModule } from './features/donation/donation.module';
import { QueueModule } from './features/queue/queue.module';
import { EventConfigModule } from './features/event/configuration/event-config.module';
import { MailModule } from './features/mail/mail.module';
import { ExportModule } from './features/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventConfigModule,
    AuthModule,
    EventModule,
    DonationModule,
    MailModule,
    QueueModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
