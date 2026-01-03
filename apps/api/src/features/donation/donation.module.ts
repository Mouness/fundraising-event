import { Module } from '@nestjs/common';
import { DonationController } from './donation.controller';
import { StripeService } from './services/stripe.service';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from '../gateway/gateway.module';

import { QueueModule } from '../queue/queue.module';
import { DonationService } from './donation.service';
import { DatabaseModule } from '../../database/database.module';
import { EventsModule } from '../events/events.module';
import { WhiteLabelingModule } from '../white-labeling/white-labeling.module';

import { PayPalService } from './services/paypal.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    ConfigModule,
    GatewayModule,
    QueueModule,
    DatabaseModule,
    EventsModule,
    WhiteLabelingModule,
  ],
  controllers: [DonationController],
  providers: [StripeService, PayPalService, PaymentService, DonationService],
  exports: [PaymentService, DonationService],
})
export class DonationModule {}
