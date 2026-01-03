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
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard } from './features/auth/guards/roles.guard';

import { WhiteLabelingModule } from './features/white-labeling/white-labeling.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
    AuthModule,
    EventsModule,
    GatewayModule,
    DonationModule,
    MailModule,
    QueueModule,
    ExportModule,
    StaffModule,
    WhiteLabelingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
