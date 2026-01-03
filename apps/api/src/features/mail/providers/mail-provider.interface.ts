export interface MailProvider {
  /**
   * Send an email.
   * @param to Recipient email address
   * @param subject Email subject
   * @param template Template name or ID
   * @param context Data to render in the template
   * @param attachments Optional list of attachments
   */
  send(
    to: string,
    subject: string,
    template: string,
    context: any,
    attachments?: { filename: string; content: Buffer }[],
  ): Promise<void>;
}
