import { z } from 'zod';

// Team creation schema
export const createTeamSchema = z.object({
  name: z.string()
    .min(1, "Team name is required")
    .min(3, "Team name must be at least 3 characters")
    .max(50, "Team name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Team name can only contain letters, numbers, spaces, hyphens, and underscores"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  members: z.array(z.string())
    .optional(),
});

// Team join schema
export const joinTeamSchema = z.object({
  teamCode: z.string()
    .min(1, "Team code is required")
    .min(6, "Team code must be at least 6 characters")
    .max(20, "Team code must be less than 20 characters"),
});

// Add member schema
export const addMemberSchema = z.object({
  userId: z.string()
    .min(1, "User ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});
