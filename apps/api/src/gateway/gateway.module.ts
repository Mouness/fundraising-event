import { Module } from '@nestjs/common';
import { DonationGateway } from './gateway.gateway';

@Module({
  providers: [DonationGateway],
  exports: [DonationGateway]
})
export class GatewayModule { }
