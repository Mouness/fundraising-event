import { z } from 'zod';

export const getDonationSchema = (t: any) => z.object({
    amount: z.number().min(1, { message: t('validation.min_value', { count: 1 }) }),
    name: z.string().min(2, { message: t('validation.min_chars', { count: 2 }) }),
    email: z.string().email({ message: t('validation.invalid_email') }),
    phone: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    message: z.string().optional(),
});

export type DonationFormValues = z.infer<ReturnType<typeof getDonationSchema>>;
