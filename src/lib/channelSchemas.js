import { z } from 'zod';

export const channelSchema = z.object({
  teamId: z.string().min(1, 'Team is required'),
  name: z
    .string()
    .min(2, 'At least 2 characters')
    .max(50, 'Max 50 characters')
    .regex(/^[a-z0-9-_]+$/, 'Use lowercase letters, numbers, hyphens, underscores'),
  displayName: z.string().min(2).max(50).optional().or(z.literal('').transform(() => undefined)),
  description: z.string().max(300).optional().or(z.literal('').transform(() => undefined)),
  type: z.enum(['public', 'private']),
});

export const channelSchemaWithDefaults = channelSchema.extend({
  type: z.enum(['public', 'private']).default('public'),
});

// TypeScript types removed for JavaScript compatibility
