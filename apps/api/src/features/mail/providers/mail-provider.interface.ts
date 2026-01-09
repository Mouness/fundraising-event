export interface MailConfig {
  provider?: 'smtp' | 'console';
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  from?: string; // Sender name/email
}

export interface MailProvider<T = Record<string, any>> {
  /**
   * Send an email.
   * @param to Recipient email address
   * @param subject Email subject
   * @param template Template name or ID (or rendered content)
   * @param context Data used to render the template
   * @param attachments Optional list of attachments
   * @param config Optional provider configuration
   */
  send(
    to: string,
    subject: string,
    template: string,
    context: T,
    attachments?: { filename: string; content: Buffer }[],
    config?: MailConfig,
  ): Promise<void>;
}
