import { router, protectedProcedure } from '../lib/trpc';
import { exportTasksInputSchema, exportReflectionsInputSchema } from '../validators/export';
import { db } from '../db';
import { tasks } from '../db/schema/tasks';
import { reflections } from '../db/schema/reflections';
import { eq, and, gte, lte } from 'drizzle-orm';

export const exportRouter = router({
	// タスクのエクスポート
	exportTasks: protectedProcedure
		.input(exportTasksInputSchema)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const conditions = [eq(tasks.userId, userId)];

			if (input.startDate) {
				conditions.push(gte(tasks.createdAt, new Date(input.startDate)));
			}
			if (input.endDate) {
				conditions.push(lte(tasks.createdAt, new Date(input.endDate)));
			}
			if (input.status) {
				conditions.push(eq(tasks.status, input.status));
			}

			const taskList = await db.query.tasks.findMany({
				where: and(...conditions),
			});

			if (input.format === 'json') {
				return {
					format: 'json' as const,
					data: JSON.stringify(taskList, null, 2),
					filename: 'tasks_' + new Date().toISOString().split('T')[0] + '.json',
				};
			}

			// CSV形式
			const headers = ['id', 'title', 'description', 'priority', 'status', 'estimatedDurationMinutes', 'actualDurationMinutes', 'createdAt', 'completedAt'];
			const csvRows = [headers.join(',')];

			for (const task of taskList) {
				const row = [
					task.id,
					'"' + (task.title || '').replace(/"/g, '""') + '"',
					'"' + (task.description || '').replace(/"/g, '""') + '"',
					task.priority,
					task.status,
					task.estimatedDurationMinutes,
					task.actualDurationMinutes || '',
					task.createdAt.toISOString(),
					task.completedAt ? task.completedAt.toISOString() : '',
				];
				csvRows.push(row.join(','));
			}

			return {
				format: 'csv' as const,
				data: csvRows.join('\n'),
				filename: 'tasks_' + new Date().toISOString().split('T')[0] + '.csv',
			};
		}),

	// リフレクションのエクスポート
	exportReflections: protectedProcedure
		.input(exportReflectionsInputSchema)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const conditions = [eq(reflections.userId, userId)];

			if (input.startDate) {
				conditions.push(gte(reflections.createdAt, new Date(input.startDate)));
			}
			if (input.endDate) {
				conditions.push(lte(reflections.createdAt, new Date(input.endDate)));
			}

			const reflectionList = await db.query.reflections.findMany({
				where: and(...conditions),
			});

			if (input.format === 'json') {
				return {
					format: 'json' as const,
					data: JSON.stringify(reflectionList, null, 2),
					filename: 'reflections_' + new Date().toISOString().split('T')[0] + '.json',
				};
			}

			// CSV形式
			const headers = ['id', 'completedTasksCount', 'totalTasksCount', 'satisfactionRating', 'energyLevel', 'achievements', 'challenges', 'learnings', 'tomorrowPriorities', 'createdAt'];
			const csvRows = [headers.join(',')];

			for (const reflection of reflectionList) {
				const row = [
					reflection.id,
					reflection.completedTasksCount,
					reflection.totalTasksCount,
					reflection.satisfactionRating,
					reflection.energyLevel || '',
					'"' + (reflection.achievements || '').replace(/"/g, '""') + '"',
					'"' + (reflection.challenges || '').replace(/"/g, '""') + '"',
					'"' + (reflection.learnings || '').replace(/"/g, '""') + '"',
					'"' + (reflection.tomorrowPriorities || '').replace(/"/g, '""') + '"',
					reflection.createdAt.toISOString(),
				];
				csvRows.push(row.join(','));
			}

			return {
				format: 'csv' as const,
				data: csvRows.join('\n'),
				filename: 'reflections_' + new Date().toISOString().split('T')[0] + '.csv',
			};
		}),
});
