import { z } from 'zod';

export const donationSchema = z.object({
    amount: z.number().min(1, 'Amount must be at least 1'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    isAnonymous: z.boolean().optional(),
    message: z.string().optional(),
});

export type DonationFormValues = z.infer<typeof donationSchema>;
