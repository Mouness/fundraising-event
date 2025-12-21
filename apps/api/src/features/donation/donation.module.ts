import { Module } from '@nestjs/common';
import { DonationController } from './donation.controller';
import { StripeService } from './services/stripe.service';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from '../gateway/gateway.module';
import { PAYMENT_PROVIDER } from './interfaces/payment-provider.interface';

@Module({
  imports: [ConfigModule, GatewayModule],
  controllers: [DonationController],
  providers: [
    StripeService,
    {
      provide: PAYMENT_PROVIDER,
      useClass: StripeService,
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class DonationModule {}
