# Communication & Post-Processing

This module handles asynchronous communication (email), document generation (PDF), and background processing.

## Architecture

- **MailService**: Central service for sending emails. It uses the `MailProvider` pattern to switch between implementations (e.g., Console, SMTP, SendGrid).
- **PdfService**: Generates PDF documents (Tax Receipts) using `pdfmake`.
- **QueueModule**: Uses BullMQ (Redis) to process background jobs.
- **ExportService**: Handles data export requests (e.g., ZIP of receipts).

## Configuration

### Email
Configure the email provider via `MAIL_PROVIDER` env variable (default: `console` in dev).
Support for white-labeling is built-in. The `MailService` fetches event-specific branding (logo, colors) using `WhiteLabelingService`.

### PDF
PDF generation is powered by `pdfmake`. Fonts are loaded from `apps/api/src/assets/fonts`.
Receipts are generated dynamically based on:
- Event branding (Logo, Colors)
- Organization details (Legal Name, Address)

### Queues
Redis is required for queues. Configure `REDIS_HOST` and `REDIS_PORT`.
Jobs are processed by `EmailProcessor` (queue name: `email`).

## Key Features

### Tax Receipts
When a donation is completed, a `donation.created` event triggers a job in the `email` queue.
The `EmailProcessor` calls `MailService.sendReceipt`, which:
1.  Fetches event configuration.
2.  Generates a PDF receipt via `PdfService`.
3.  Renders the email template (`src/features/mail/templates/receipt.html`).
4.  Sends the email with the PDF attachment.

### Bulk Export
Admins can download all receipts for an event as a ZIP file.
Endpoint: `GET /export/receipts/zip?eventId=...`
This is handled by `ExportService` which generates PDFs on the fly and streams them into a ZIP.

## Setup & Testing
1.  Ensure Redis is running.
2.  Run tests: `pnpm --filter api test src/test/features/mail src/test/features/export`
