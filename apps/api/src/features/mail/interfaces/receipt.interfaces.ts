import { CommunicationConfig } from '@fundraising/white-labeling'

/**
 * ReceiptData (Input)
 *
 * Represents the raw transaction data input into the MailService.
 * This contains the core details of the donation itself.
 */
export interface ReceiptData {
    eventSlug?: string
    amount: number
    transactionId?: string
    date?: Date | string
    name?: string
    donorName?: string
    // Allow additional properties to be passed through to the template context
    [key: string]: any
}

/**
 * ReceiptContext (Output for Templates)
 *
 * Represents the fully resolved data available to email templates and PDF generators.
 * It combines the raw `ReceiptData` with white-labeling configuration (colors, legal names, etc.)
 * and computed properties (formatted dates, resolved URLs).
 */
export interface ReceiptContext extends Omit<CommunicationConfig, 'pdf' | 'email'> {
    eventName: string
    logoUrl: string
    primaryColor: string
    year: number
    currency: string
    date: string
    amount: number
    transactionId?: string
    donorName?: string
    footerText?: string
    /**
     * Translated content/labels for the receipt
     */
    content: {
        title: string
        receiptNumber: string
        date: string
        donorName: string
        amount: string // Label "Amount Donated"
        thankYou: string
        authorizedSignature: string
        footerTextDefault?: string // "An official PDF receipt..."
        taxIdLabel: string // "Tax ID:"
        websiteLabel?: string // "Website" or inherited from template needing it?
        visitWebsite?: string // "Visit our website"
    }
    [key: string]: any // Allow keys from ReceiptData
}
