import { Module } from '@nestjs/common';
import { DonationController } from './donation.controller';
import { StripeService } from './services/stripe.service';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [ConfigModule, GatewayModule],
    controllers: [DonationController],
    providers: [StripeService],
    exports: [StripeService],
})
export class DonationModule { }
