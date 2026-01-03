export interface SendReceiptJobData {
  email: string;
  amount: number;
  transactionId: string;
  date: Date | string; // BullMQ serializes dates to strings usually
  donorName?: string;
  eventSlug: string;
}
