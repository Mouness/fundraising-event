import { z } from 'zod';

export const donationSchema = z.object({
    amount: z.number().min(1, { message: 'Amount must be at least 1' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    message: z.string().optional(),
});

export type DonationFormValues = z.infer<typeof donationSchema>;
