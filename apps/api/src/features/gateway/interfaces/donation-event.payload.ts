export interface DonationEventPayload {
    amount: number
    currency: string
    donorName: string
    message?: string
    isAnonymous?: boolean
    eventId?: string // Optional for future room support
}
