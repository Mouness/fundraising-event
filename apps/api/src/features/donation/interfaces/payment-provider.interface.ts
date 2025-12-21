export interface CreatePaymentIntentResult {
  clientSecret: string;
  id: string;
}

export interface PaymentProvider {
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: any,
  ): Promise<CreatePaymentIntentResult>;
  constructEventFromPayload(signature: string, payload: Buffer): Promise<any>;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';
