import { Injectable, Logger } from '@nestjs/common'
import { ConsoleMailProvider } from './providers/console-mail.provider'
import { NodemailerProvider } from './providers/nodemailer.provider'
import type { MailProvider } from './providers/mail-provider.interface'
import { WhiteLabelingService } from '../white-labeling/white-labeling.service'
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises'
import * as path from 'path'

import { PdfService } from '../pdf/pdf.service'

import { CommunicationConfig, EventConfig } from '@fundraising/white-labeling'
import { ReceiptData, ReceiptContext } from './interfaces/receipt.interfaces'
import { I18nUtil } from '../../common/utils/i18n.util'

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name)

    constructor(
        private readonly consoleMailProvider: ConsoleMailProvider,
        private readonly nodemailerProvider: NodemailerProvider,
        private readonly whiteLabelingService: WhiteLabelingService,
        private readonly configService: ConfigService,
        private readonly pdfService: PdfService,
    ) {}

    /**
     * Orchestrates the receipt sending process.
     * 1. Validates input
     * 2. Loads configuration
     * 3. Builds context & assets
     * 4. Selects provider and sends
     */
    async sendReceipt(to: string, data: ReceiptData) {
        if (!data.eventSlug) {
            this.logger.error('Missing eventSlug in sendReceipt data. Cannot send branded receipt.')
            return
        }

        const config = await this.whiteLabelingService.getEventSettings(data.eventSlug)
        if (!config) {
            this.logger.error(`Event config not found for slug: ${data.eventSlug}`)
            return
        }

        const { communication: commConfig } = config
        const subject =
            commConfig.email?.subjectLine || `Receipt for your donation to ${config.content.title}`

        // Prepare data
        const context = this.buildReceiptContext(config, data)
        const attachments = await this.generatePdfAttachment(context)
        const template = await this.renderTemplate('receipt', context)

        // Send using selected provider
        const { provider, config: providerConfig } = this.getMailProvider(commConfig.email)
        await provider.send(to, subject, template, context, attachments, providerConfig)
    }

    /**
     * Determines which mail provider to use based on configuration.
     */
    private getMailProvider(emailConfig: any): {
        provider: MailProvider
        config: any
    } {
        const providerType = emailConfig?.provider || 'console'

        if (providerType === 'smtp') {
            return {
                provider: this.nodemailerProvider,
                config: emailConfig?.config?.smtp || {},
            }
        }

        return {
            provider: this.consoleMailProvider,
            config: {},
        }
    }

    private buildReceiptContext(config: EventConfig, data: ReceiptData): ReceiptContext {
        const { communication: commConfig, theme } = config
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173'
        const primaryColor = theme?.variables?.['--primary'] || '#000000'
        const currency = config.donation.payment.currency || 'USD'
        const formattedDate = new Date(data.date || new Date()).toLocaleDateString()

        const locale = config.locales?.default || 'en'
        const localeData = I18nUtil.getEffectiveLocaleData(locale, config.locales?.overrides)

        return {
            ...data,
            eventName: config.content.title,
            logoUrl: this.resolveLogoUrl(theme?.assets?.logo, frontendUrl),
            primaryColor,
            legalName: commConfig.legalName,
            taxId: commConfig.taxId,
            address: commConfig.address,
            phone: commConfig.phone,
            footerText: commConfig.footerText,
            signatureText: commConfig.signatureText,
            year: new Date().getFullYear(),
            currency,
            date: formattedDate,
            content: {
                title:
                    I18nUtil.t(localeData, 'thankyou.receipt.title') === 'thankyou.receipt.title'
                        ? 'Official Donation Receipt'
                        : I18nUtil.t(localeData, 'thankyou.receipt.title'), // Fallback if key missing
                receiptNumber: I18nUtil.t(localeData, 'thankyou.receipt.transaction_id'),
                date: I18nUtil.t(localeData, 'thankyou.receipt.date'),
                donorName: I18nUtil.t(localeData, 'thankyou.receipt.from'),
                amount: I18nUtil.t(localeData, 'donation.amount'),
                thankYou: I18nUtil.t(localeData, 'thankyou.receipt.message_body', {
                    donorName: data.donorName || data.name || 'Supporter',
                }), // Need to add this key or fallback
                authorizedSignature: I18nUtil.t(
                    localeData,
                    'thankyou.receipt.authorized_signature',
                ), // Need key
                footerTextDefault: I18nUtil.t(localeData, 'thankyou.receipt.pdf_attached'), // Need key
                taxIdLabel: I18nUtil.t(localeData, 'thankyou.receipt.tax_id_label'),
                websiteLabel: I18nUtil.t(localeData, 'thankyou.receipt.website_label'),
                visitWebsite: I18nUtil.t(localeData, 'thankyou.receipt.visit_website'),
            },
        }
    }

    private resolveLogoUrl(logoPath: string | undefined, frontendUrl: string): string {
        if (!logoPath) return ''
        return logoPath.startsWith('http') ? logoPath : `${frontendUrl}${logoPath}`
    }

    private async generatePdfAttachment(
        context: ReceiptContext,
    ): Promise<{ filename: string; content: Buffer }[]> {
        try {
            const pdfBuffer = await this.pdfService.generateReceipt(context)
            return [
                {
                    filename: `Receipt-${context.transactionId || 'donation'}.pdf`,
                    content: pdfBuffer,
                },
            ]
        } catch (error) {
            this.logger.error('Failed to generate PDF receipt', error)
            return []
        }
    }

    private async renderTemplate(
        templateName: string,
        context: Record<string, any>,
    ): Promise<string> {
        try {
            const templatePath = path.join(
                process.cwd(),
                'src/features/mail/templates',
                `${templateName}.html`,
            )

            let html = await fs.readFile(templatePath, 'utf-8')

            Object.keys(context).forEach((key) => {
                const regex = new RegExp(`{{${key}}}`, 'g')
                html = html.replace(regex, String(context[key]))
            })

            return html
        } catch (err) {
            this.logger.warn(`Failed to load template ${templateName}:`, err)
            return 'Receipt content (Template error)'
        }
    }
}
