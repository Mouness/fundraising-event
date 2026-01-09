# Donations & Payments

This section covers how to track incoming funds and manage the financial aspect of your event.

## Donation Tracking

All transactions are recorded in the central database. You can view them in two places:

1.  **Global Dashboard**: Shows receipts from _all_ events.
2.  **Event Dashboard**: Shows only receipts for that specific campaign.

### filtering

You can filter the donation list by:

- **Date Range**
- **Status** (Succeeded, Pending, Failed)
- **Payment Method** (Stripe, PayPal, Cash, etc.)

## Receipts

The platform automatically generates PDF tax receipts for every successful donation.

- **Email**: Receipts are automatically emailed to the donor if an email address was provided.
- **Manual Download**: Admins can download a PDF copy of any receipt from the donation list details view.
- **Bulk Export**: Use the "Export Receipts" button on the dashboard to download a ZIP file containing all receipts for a selected period.

## Payment Providers

To accept online payments, you must configure a payment processor. This is done in the **Global Settings**.

[View Global Payment Settings Guide](global_settings.md#5-payments)

> Ensure your payment keys are for the **Production** environment when running a real event. Test keys should only be used during setup.

## Donation Flow Guide

Here is the standard checkout flow your donors will experience.

### 1. Donor Information

Donors fill in their basic contact details.

![Donation Form](../assets/donation_form.png)

_Example Data:_

- **Name**: `Test Donor`
- **Email**: `donor@example.com`

### 2. Payment Details

Donors choose their payment method and enter credentials.

![Payment Screen](../assets/donation_payment.png)

_Test Credit Card (Stripe Mode):_

- **Card**: `4242 4242 4242 4242`
- **Exp**: `10/30`
- **CVC**: `123`
