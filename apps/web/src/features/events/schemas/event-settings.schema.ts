import { z } from 'zod';

export const eventSettingsSchema = z.object({
    // General
    name: z.string().min(1),
    goalAmount: z.coerce.number().min(1),
    slug: z.string().min(1),
    status: z.enum(['active', 'draft', 'closed']),
    date: z.string().optional(),
    description: z.string().optional(),
    formConfig: z.object({
        phone: z.object({ enabled: z.boolean(), required: z.boolean().default(false) }),
        address: z.object({ enabled: z.boolean(), required: z.boolean().default(false) }),
        company: z.object({ enabled: z.boolean(), required: z.boolean().default(false) }),
        message: z.object({ enabled: z.boolean(), required: z.boolean().default(false) }),
        anonymous: z.object({ enabled: z.boolean(), required: z.boolean().default(false) }),
    }),
    live: z.object({
        theme: z.enum(['classic', 'modern', 'elegant']).default('classic'),
    }).optional(),
    // Branding Overrides
    useGlobalBranding: z.boolean(),
    organization: z.string().optional(),
    assets: z.object({
        logo: z.string().url().optional().or(z.literal('')),
        backgroundLanding: z.string().url().optional().or(z.literal('')),
        backgroundLive: z.string().url().optional().or(z.literal('')),
    }).optional(),
    landing: z.object({
        impact: z.object({ url: z.string().url().optional().or(z.literal('')) }),
        community: z.object({ url: z.string().url().optional().or(z.literal('')) }),
        interactive: z.object({ url: z.string().url().optional().or(z.literal('')) }),
    }).optional(),
    themeVariables: z.array(z.object({
        key: z.string(),
        value: z.string()
    })).optional(),
    communication: z.object({
        enabled: z.boolean().default(false),
        senderName: z.string().optional(),
        replyTo: z.string().email().optional().or(z.literal('')),
        subjectLine: z.string().optional(),
        supportEmail: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
        address: z.string().optional(),
    }).optional(),
});

export type EventSettingsFormValues = z.infer<typeof eventSettingsSchema>;
