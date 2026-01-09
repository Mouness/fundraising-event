import { z } from 'zod';

export const createEventSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
    goalAmount: z.coerce.number().min(1),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
