import { z } from 'zod'

export const editDonationSchema = z.object({
    donorName: z.string().min(1),
    donorEmail: z.string().email().optional().or(z.literal('')),
    message: z.string().optional(),
    isAnonymous: z.boolean(),
})

export type EditDonationFormValues = z.infer<typeof editDonationSchema>
