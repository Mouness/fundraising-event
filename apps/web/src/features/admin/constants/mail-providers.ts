export const SMTP_PROVIDERS = {
    resend: {
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        user: 'resend',
    },
    gmail: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: '',
    },
    outlook: {
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // STARTTLS
        user: '',
    },
} as const

export type SmtpProviderType = keyof typeof SMTP_PROVIDERS
