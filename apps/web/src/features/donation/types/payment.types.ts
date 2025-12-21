export interface PaymentProviderProps {
    sessionData: any; // Flexible payload (e.g., clientSecret for Stripe, orderID for PayPal)
    onSuccess: () => void;
    onBack?: () => void;
    onError?: (message: string) => void;
    amount: number;
    currency: string;
    config?: Record<string, any>; // Static config from event-config.json
}
