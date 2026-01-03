import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  BadRequestException,
  Inject,
  Get,
  Query,
  Res,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

import { DonationService } from './donation.service';

import { CreateDonationDto, OfflineDonationDto } from '@fundraising/types';

import { PaymentService } from './services/payment.service';

@Controller('donations')
export class DonationController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly donationService: DonationService,
  ) { }

  @Get()
  async findAll(
    @Query('eventId') eventId?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.donationService.findAll(eventId, limit, offset, search, status);
  }

  @Get('export')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async exportCsv(
    @Res() res: any,
    @Query('eventId') eventId?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const csv = await this.donationService.getExportData(
      eventId,
      search,
      status,
    );
    const filename = `donations-${new Date().toISOString().split('T')[0]}.csv`;

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return res.send(csv);
  }

  @Post('intent')
  async createPaymentIntent(@Body() body: CreateDonationDto) {
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }
    return this.paymentService.createPaymentIntent(
      body.amount,
      body.currency || 'usd',
      body.metadata,
    );
  }

  @Post('stripe/webhook')
  async handleStripeWebhook(@Req() req: RawBodyRequest<Request>) {
    try {
      if (!req.rawBody) {
        throw new BadRequestException('Raw body not available');
      }
      // Pass headers for signature extraction
      const event = await this.paymentService.constructEventFromPayload(
        req.headers,
        req.rawBody,
        'stripe',
      );

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('PaymentIntent was successful!', paymentIntent);

          await this.donationService.processSuccessfulDonation({
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            transactionId: paymentIntent.id,
            paymentMethod: 'stripe',
            donorName: paymentIntent.metadata?.donorName,
            donorEmail: paymentIntent.metadata?.donorEmail,
            isAnonymous: paymentIntent.metadata?.isAnonymous === 'true',
            message: paymentIntent.metadata?.message,
            metadata: paymentIntent.metadata,
            eventId: paymentIntent.metadata?.eventId,
          });
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }

  @Post('paypal/webhook')
  async handlePayPalWebhook(@Req() req: RawBodyRequest<Request>) {
    try {
      if (!req.rawBody) {
        throw new BadRequestException('Raw body not available');
      }

      const event = await this.paymentService.constructEventFromPayload(
        req.headers,
        req.rawBody,
        'paypal',
      );

      if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
        const resource = event.resource;
        const intentId = resource.id; // Order ID match
        const purchaseUnit = resource.purchase_units?.[0];
        const amountValue = purchaseUnit?.amount?.value;
        const amountCents = Math.round(parseFloat(amountValue || '0') * 100);

        // Parse metadata from custom_id which we stored as JSON string
        let metadata: any = {};
        if (purchaseUnit?.custom_id) {
          try {
            metadata = JSON.parse(purchaseUnit.custom_id);
          } catch (e) {
            console.warn('Failed to parse PayPal metadata', e);
          }
        }

        // Payer info
        const payerEmail = resource.payer?.email_address;
        const payerName = [
          resource.payer?.name?.given_name,
          resource.payer?.name?.surname,
        ]
          .join(' ')
          .trim();

        await this.donationService.processSuccessfulDonation({
          amount: amountCents,
          currency: purchaseUnit?.amount?.currency_code || 'USD',
          transactionId: intentId,
          paymentMethod: 'paypal',
          donorName: payerName || metadata.donorName,
          donorEmail: payerEmail || metadata.donorEmail,
          isAnonymous: metadata.isAnonymous,
          message: metadata.message,
          metadata: metadata,
          eventId: metadata.eventId,
        });
      }

      return { received: true };
    } catch (err) {
      throw new BadRequestException(`PayPal Webhook Error: ${err.message}`);
    }
  }
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async createOfflineDonation(
    @Body() body: OfflineDonationDto,
    @Req() req: any,
  ) {
    const user = req.user;
    const eventId = user.eventId || body.eventId; // Use token eventId if available, fallback to body

    if (!eventId) {
      throw new BadRequestException('Event ID is required');
    }
    if (!body.amount || body.amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    console.log('Received offline donation:', body);

    // Generate a pseudo-ID for transaction if it's cash, or use timestamp
    const txId = `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const currency = await this.paymentService.getGlobalCurrency();

    await this.donationService.processSuccessfulDonation({
      amount: body.amount,
      currency: currency,
      transactionId: txId,
      paymentMethod: body.type || 'cash',
      donorName: body.donorName,
      donorEmail: body.donorEmail,
      isAnonymous: !body.donorName,
      message: `Collected via ${body.type}`,
      metadata: {
        isOfflineCollected: true,
        collectedAt: body.collectedAt,
        collectorId: user.userId,
      },
      eventId: eventId,
    });

    return { success: true };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async updateDonation(
    @Param('id') id: string,
    @Body()
    body: {
      donorName?: string;
      donorEmail?: string;
      isAnonymous?: boolean;
      message?: string;
    },
  ) {
    return this.donationService.update(id, body);
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async cancelDonation(
    @Param('id') id: string,
    @Body() body: { shouldRefund?: boolean },
  ) {
    return this.donationService.cancel(id, body.shouldRefund);
  }
}
