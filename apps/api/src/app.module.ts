import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './features/event/event.module';
import { GatewayModule } from './features/gateway/gateway.module';
import { DatabaseModule } from './database/database.module';
import { DonationModule } from './features/donation/donation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    EventModule,
    GatewayModule,
    DonationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
