import { z } from 'zod';

// 時刻フォーマット（HH:MM）
const timeFormatSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

// 日付フォーマット（YYYY-MM-DD）
const dateFormatSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createDailyPlanSchema = z.object({
	planDate: dateFormatSchema,
	workStartTime: timeFormatSchema.default('09:00'),
	workEndTime: timeFormatSchema.default('18:00'),
});

export const updateDailyPlanSchema = z.object({
	id: z.string(),
	workStartTime: timeFormatSchema.optional(),
	workEndTime: timeFormatSchema.optional(),
});

export const finalizeDailyPlanSchema = z.object({
	id: z.string(),
});

export const timeBlockStatusSchema = z.enum([
	'planned',
	'active',
	'completed',
	'skipped',
	'overrun'
]);

export const createTimeBlockSchema = z.object({
	dailyPlanId: z.string(),
	taskId: z.string(),
	startTime: z.date(),
	plannedDurationMinutes: z.number()
		.int()
		.min(15, '最小15分から設定できます')
		.max(480, '最大8時間まで設定できます'),
	sortOrder: z.number().int().min(0).default(0),
	notes: z.string().max(500).optional(),
});

export const updateTimeBlockSchema = z.object({
	id: z.string(),
	startTime: z.date().optional(),
	plannedDurationMinutes: z.number().int().min(15).max(480).optional(),
	sortOrder: z.number().int().min(0).optional(),
	notes: z.string().max(500).optional(),
	status: timeBlockStatusSchema.optional(),
	actualDurationMinutes: z.number().int().min(0).optional(),
});

export type CreateDailyPlanInput = z.infer<typeof createDailyPlanSchema>;
export type UpdateDailyPlanInput = z.infer<typeof updateDailyPlanSchema>;
export type CreateTimeBlockInput = z.infer<typeof createTimeBlockSchema>;
export type UpdateTimeBlockInput = z.infer<typeof updateTimeBlockSchema>;
