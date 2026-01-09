import { z } from 'zod'

export const donationSchema = z.object({
    amount: z.number().min(1),
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    company: z.string().optional(),
    isAnonymous: z.boolean().optional(),
    message: z.string().optional(),
})

export type DonationFormValues = z.infer<typeof donationSchema>
