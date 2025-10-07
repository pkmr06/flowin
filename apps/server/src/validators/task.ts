import { z } from 'zod';

export const taskPrioritySchema = z.enum(['high', 'medium', 'low']);
export const taskStatusSchema = z.enum([
	'pending',
	'in_progress',
	'completed',
	'cancelled'
]);

export const createTaskSchema = z.object({
	title: z.string()
		.min(1, 'タイトルは必須です')
		.max(200, 'タイトルは200文字以内で入力してください'),
	description: z.string()
		.max(2000, '説明は2000文字以内で入力してください')
		.optional(),
	estimatedDurationMinutes: z.number()
		.int('整数で入力してください')
		.min(15, '最小15分から設定できます')
		.max(480, '最大8時間まで設定できます')
		.default(30),
	priority: taskPrioritySchema.default('medium'),
});

export const updateTaskSchema = z.object({
	id: z.string(),
	title: z.string()
		.min(1)
		.max(200)
		.optional(),
	description: z.string()
		.max(2000)
		.optional(),
	estimatedDurationMinutes: z.number()
		.int()
		.min(15)
		.max(480)
		.optional(),
	priority: taskPrioritySchema.optional(),
	status: taskStatusSchema.optional(),
});

export const taskFiltersSchema = z.object({
	status: taskStatusSchema.optional(),
	priority: taskPrioritySchema.optional(),
	search: z.string().optional(),
	sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'title'])
		.default('createdAt'),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
	limit: z.number().int().min(1).max(100).default(50),
	offset: z.number().int().min(0).default(0),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
