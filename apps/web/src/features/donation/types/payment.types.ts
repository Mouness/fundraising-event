export interface PaymentProviderProps {
    sessionData: {
        id?: string
        clientSecret?: string
        orderID?: string
        [key: string]: unknown
    }
    onSuccess: () => void
    onBack?: () => void
    onError?: (message: string) => void
    amount: number
    currency: string
    config?: Record<string, unknown> // Static config from event-config.json
}
