import { Injectable, Logger } from '@nestjs/common'
import { IncomingHttpHeaders } from 'http'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import {
    PaymentProvider,
    CreatePaymentIntentResult,
    PaymentConfig,
} from '../interfaces/payment-provider.interface'
import { PayPalProviderConfig } from '@fundraising/white-labeling'

@Injectable()
export class PayPalService implements PaymentProvider {
    private readonly logger = new Logger(PayPalService.name)

    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    private getCredentials(config?: PaymentConfig) {
        const ppConfig = config as PayPalProviderConfig
        const clientId = ppConfig?.clientId || this.configService.get<string>('PAYPAL_CLIENT_ID')
        const clientSecret =
            ppConfig?.clientSecret || this.configService.get<string>('PAYPAL_CLIENT_SECRET')
        const sandbox =
            ppConfig?.sandbox ?? this.configService.get<string>('PAYPAL_SANDBOX') === 'true'

        if (!clientId || !clientSecret) {
            this.logger.warn('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not defined')
        }

        return { clientId, clientSecret, sandbox }
    }

    private getBaseUrl(sandbox: boolean): string {
        return sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'
    }

    private async getAccessToken(config?: PaymentConfig): Promise<string> {
        const { clientId, clientSecret, sandbox } = this.getCredentials(config)
        const baseUrl = this.getBaseUrl(sandbox)

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        try {
            const { data } = await firstValueFrom(
                this.httpService.post(
                    `${baseUrl}/v1/oauth2/token`,
                    'grant_type=client_credentials',
                    {
                        headers: {
                            Authorization: `Basic ${auth}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                ),
            )
            return data.access_token
        } catch (error) {
            this.logger.error(`Error getting access token: ${error.message}`)
            throw error
        }
    }

    /**
     * Creates a PayPal Order (equivalent to PaymentIntent)
     */
    async createPaymentIntent(
        amount: number,
        currency: string = 'USD',
        metadata: Record<string, any> = {},
        config?: PaymentConfig,
    ): Promise<CreatePaymentIntentResult> {
        try {
            const accessToken = await this.getAccessToken(config)
            const { sandbox } = this.getCredentials(config)
            const baseUrl = this.getBaseUrl(sandbox)

            // PayPal expects standard units (e.g. 10.00), not cents.
            // Assuming amount passed is in CENTS.
            const amountUnit = (amount / 100).toFixed(2)

            const payload = {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency.toUpperCase(),
                            value: amountUnit,
                        },
                        custom_id: JSON.stringify(metadata), // Storing metadata in custom_id or just relying on local DB
                    },
                ],
            }

            const { data } = await firstValueFrom(
                this.httpService.post(`${baseUrl}/v2/checkout/orders`, payload, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }),
            )

            return {
                id: data.id,
                // PayPal doesn't have a 'client_secret' in the same way Stripe does for some flows,
                // but for standard JS SDK, the Order ID is enough.
                // We will return the ID as the secret too or null. Use ID for both to be safe.
                clientSecret: data.id,
            }
        } catch (error) {
            this.logger.error(`Error creating PayPal order: ${error.message}`)
            throw error
        }
    }

    // Verification via API
    async constructEventFromPayload(
        headers: IncomingHttpHeaders | string,
        payload: Buffer,
        config?: PaymentConfig,
    ): Promise<any> {
        const ppConfig = config as PayPalProviderConfig
        const webhookId = ppConfig?.webhookId || this.configService.get<string>('PAYPAL_WEBHOOK_ID')

        if (!webhookId) {
            this.logger.warn('PAYPAL_WEBHOOK_ID not set. Skipping verification (INSECURE).')
            return JSON.parse(payload.toString())
        }

        const accessToken = await this.getAccessToken(config)
        const { sandbox } = this.getCredentials(config) // Get sandbox status
        const baseUrl = this.getBaseUrl(sandbox)
        const body = JSON.parse(payload.toString())

        const verificationBody = {
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: body,
        }

        try {
            const { data: result } = await firstValueFrom(
                this.httpService.post(
                    `${baseUrl}/v1/notifications/verify-webhook-signature`,
                    verificationBody,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            )

            if (result.verification_status !== 'SUCCESS') {
                throw new Error('PayPal webhook verification failed: Invalid Signature')
            }

            return body
        } catch (error) {
            this.logger.error(`Webhook verification error: ${error.message}`)
            throw error
        }
    }

    async refundDonation(paymentId: string, config?: PaymentConfig): Promise<any> {
        try {
            const accessToken = await this.getAccessToken(config)
            const { sandbox } = this.getCredentials(config)
            const baseUrl = this.getBaseUrl(sandbox)

            // Look up the capture ID associated with this Order ID
            const { data: orderData } = await firstValueFrom(
                this.httpService.get(`${baseUrl}/v2/checkout/orders/${paymentId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }),
            )

            // Find capture ID from purchase units
            const captureId = orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id
            if (!captureId)
                throw new Error('No capture found for this order. Has it been captured?')

            const { data } = await firstValueFrom(
                this.httpService.post(
                    `${baseUrl}/v2/payments/captures/${captureId}/refund`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            )

            return data
        } catch (error) {
            this.logger.error(`Error refunding PayPal donation: ${error.message}`)
            throw error
        }
    }
}
