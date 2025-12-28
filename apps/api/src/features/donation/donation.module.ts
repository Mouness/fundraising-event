import { Module } from '@nestjs/common';
import { DonationController } from './donation.controller';
import { StripeService } from './services/stripe.service';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from '../gateway/gateway.module';
import { PAYMENT_PROVIDER } from './interfaces/payment-provider.interface';
import { QueueModule } from '../queue/queue.module';
import { DonationService } from './donation.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [ConfigModule, GatewayModule, QueueModule, DatabaseModule],
  controllers: [DonationController],
  providers: [
    StripeService,
    DonationService,
    {
      provide: PAYMENT_PROVIDER,
      useClass: StripeService,
    },
  ],
  exports: [PAYMENT_PROVIDER, DonationService],
})
export class DonationModule { }
