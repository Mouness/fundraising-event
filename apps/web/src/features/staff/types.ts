export type DonationType = 'cash' | 'check' | 'pledge' | 'other';

export interface PendingDonation {
    id: string;
    amount: number; // Stored in cents
    type: DonationType;
    name?: string;
    email?: string;
    createdAt: number;
    status: 'pending' | 'synced' | 'failed';
    error?: string;
}
