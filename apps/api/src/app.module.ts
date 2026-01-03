import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './features/events/events.module';
import { GatewayModule } from './features/gateway/gateway.module';
import { DatabaseModule } from './database/database.module';
import { DonationModule } from './features/donation/donation.module';
import { QueueModule } from './features/queue/queue.module';
import { MailModule } from './features/mail/mail.module';
import { ExportModule } from './features/export/export.module';
import { StaffModule } from './features/staff/staff.module';

import { WhiteLabelingModule } from './features/white-labeling/white-labeling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
    AuthModule,
    EventsModule,
    DonationModule,
    MailModule,
    QueueModule,
    ExportModule,
    StaffModule,
    StaffModule,
    WhiteLabelingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
