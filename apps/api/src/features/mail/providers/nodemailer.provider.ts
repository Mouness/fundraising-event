import { Injectable, Logger } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config'
import { MailProvider, MailConfig } from './mail-provider.interface'

@Injectable()
export class NodemailerProvider implements MailProvider {
    private readonly logger = new Logger(NodemailerProvider.name)

    constructor(private readonly configService: ConfigService) {}

    async send(
        to: string,
        subject: string,
        template: string,
        context: Record<string, any>,
        attachments?: { filename: string; content: Buffer }[],
        config?: MailConfig,
    ): Promise<void> {
        const host = config?.host || this.configService.get<string>('SMTP_HOST')
        const port = config?.port || this.configService.get<number>('SMTP_PORT') || 587
        const secure = config?.secure ?? port === 465
        const user = config?.auth?.user || this.configService.get<string>('SMTP_USER')
        const pass = config?.auth?.pass || this.configService.get<string>('SMTP_PASS')
        const from = config?.from || this.configService.get<string>('SMTP_FROM')

        if (!host) {
            this.logger.error('SMTP configuration missing (Host). Cannot send email.')
            throw new Error('SMTP configuration missing')
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: user ? { user, pass } : undefined,
        })

        // Verify connection config
        try {
            await transporter.verify()
        } catch (error) {
            this.logger.error('SMTP Connection failed', error)
            throw error
        }

        const mailOptions = {
            from: from || user, // Default to auth user if from is not set
            to,
            subject,
            html: template,
            attachments,
        }

        try {
            const info = await transporter.sendMail(mailOptions)
            this.logger.log(`Message sent: ${info.messageId}`)
        } catch (error) {
            this.logger.error('Error sending email via SMTP', error)
            throw error
        }
    }
}
