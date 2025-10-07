import { z } from 'zod';

export const exportFormatSchema = z.enum(['csv', 'json']);

export const exportTasksInputSchema = z.object({
	format: exportFormatSchema,
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
});

export const exportReflectionsInputSchema = z.object({
	format: exportFormatSchema,
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

export type ExportFormat = z.infer<typeof exportFormatSchema>;
export type ExportTasksInput = z.infer<typeof exportTasksInputSchema>;
export type ExportReflectionsInput = z.infer<typeof exportReflectionsInputSchema>;
