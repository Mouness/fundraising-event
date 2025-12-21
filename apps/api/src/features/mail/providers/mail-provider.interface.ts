export interface MailProvider {
    /**
     * Send an email.
     * @param to Recipient email address
     * @param subject Email subject
     * @param template Template name or ID
     * @param context Data to render in the template
     */
    send(to: string, subject: string, template: string, context: any): Promise<void>;
}
