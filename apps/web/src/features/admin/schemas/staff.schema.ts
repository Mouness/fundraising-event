import { z } from 'zod'

export const staffSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(4).max(6),
})

export type StaffFormValues = z.infer<typeof staffSchema>
