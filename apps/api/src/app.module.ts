import { Module } from '@nestjs/common'
import { AuthModule } from './features/auth/auth.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventsModule } from './features/events/events.module'
import { GatewayModule } from './features/gateway/gateway.module'
import { DatabaseModule } from './database/database.module'
import { DonationModule } from './features/donation/donation.module'
import { QueueModule } from './features/queue/queue.module'
import { MailModule } from './features/mail/mail.module'
import { ExportModule } from './features/export/export.module'
import { StaffModule } from './features/staff/staff.module'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import Redis from 'ioredis'

import { WhiteLabelingModule } from './features/white-labeling/white-labeling.module'
import { HealthModule } from './features/health/health.module'

@Module({
    imports: [
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [
                    {
                        ttl: 60000,
                        limit: 100,
                    },
                ],
                storage: new ThrottlerStorageRedisService(
                    new Redis({
                        host: config.get('REDIS_HOST') || 'localhost',
                        port: parseInt(config.get('REDIS_PORT') || '6379'),
                    }),
                ),
            }),
        }),
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
        HealthModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
