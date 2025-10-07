import { z } from 'zod';

export const createReflectionSchema = z.object({
	dailyPlanId: z.string(),
	completedTasksCount: z.number().int().min(0),
	totalTasksCount: z.number().int().min(0),
	satisfactionRating: z.number().int().min(1).max(5),
	energyLevel: z.number().int().min(1).max(5).optional(),
	achievements: z.string().max(1000).optional(),
	challenges: z.string().max(1000).optional(),
	learnings: z.string().max(1000).optional(),
	tomorrowPriorities: z.string().max(1000).optional(),
});

export const updateReflectionSchema = z.object({
	id: z.string(),
	satisfactionRating: z.number().int().min(1).max(5).optional(),
	energyLevel: z.number().int().min(1).max(5).optional(),
	achievements: z.string().max(1000).optional(),
	challenges: z.string().max(1000).optional(),
	learnings: z.string().max(1000).optional(),
	tomorrowPriorities: z.string().max(1000).optional(),
});

export type CreateReflectionInput = z.infer<typeof createReflectionSchema>;
export type UpdateReflectionInput = z.infer<typeof updateReflectionSchema>;
