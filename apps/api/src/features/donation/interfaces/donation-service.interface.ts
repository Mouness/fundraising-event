export interface CreateDonationParams {
    amount: number // in cents
    currency?: string
    transactionId: string
    status: 'COMPLETED' | 'PENDING' | 'FAILED'
    paymentMethod: string
    donorName?: string
    donorEmail?: string
    message?: string
    isAnonymous?: boolean
    metadata?: Record<string, any>
    eventId?: string
    staffMemberId?: string
}
