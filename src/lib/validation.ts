import { z } from 'zod';

// Maximum lengths for text fields
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_SHORT_TEXT_LENGTH = 500;

// Goal validation schema
export const goalSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(MAX_TITLE_LENGTH, `Title must be less than ${MAX_TITLE_LENGTH} characters`),
  category: z.string().max(50).optional().nullable(),
  target_date: z.string().optional().nullable(),
  priority: z.string().regex(/^[1-4]$/, 'Invalid priority'),
  success_metric: z.string()
    .max(MAX_SHORT_TEXT_LENGTH, `Success metric must be less than ${MAX_SHORT_TEXT_LENGTH} characters`)
    .optional()
    .nullable(),
  why: z.string()
    .max(MAX_DESCRIPTION_LENGTH, `Why must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .nullable(),
  constraints: z.string()
    .max(MAX_DESCRIPTION_LENGTH, `Constraints must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .nullable(),
});

// Habit validation schema
export const habitSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Habit name is required')
    .max(MAX_TITLE_LENGTH, `Habit name must be less than ${MAX_TITLE_LENGTH} characters`),
  description: z.string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .nullable(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  target_value: z.string().optional(),
  metric_unit: z.string()
    .max(50, 'Unit must be less than 50 characters')
    .optional()
    .nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

// Mentor chat message validation
export const mentorMessageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message must be less than ${MAX_MESSAGE_LENGTH} characters`),
});

// Helper to validate and return errors
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message || 'Validation failed' };
}
