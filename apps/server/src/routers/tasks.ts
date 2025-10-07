import { router, protectedProcedure } from '../lib/trpc';
import { z } from 'zod';
import { db } from '../db';
import { tasks, onboardingStates } from '../db/schema/tasks';
import { eq, and, desc, asc, like, or } from 'drizzle-orm';
import {
	createTaskSchema,
	updateTaskSchema,
	taskFiltersSchema,
} from '../validators/task';
import {
	validateStatusTransition,
	shouldSetCompletedAt,
} from '../lib/task-status';
import { TRPCError } from '@trpc/server';

export const tasksRouter = router({
	// タスク作成
	create: protectedProcedure
		.input(createTaskSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const now = new Date();

			const newTask = await db.insert(tasks).values({
				userId,
				title: input.title,
				description: input.description,
				estimatedDurationMinutes: input.estimatedDurationMinutes,
				priority: input.priority,
				status: 'pending',
				createdAt: now,
				updatedAt: now,
			}).returning();

			return newTask[0];
		}),

	// タスク一覧取得
	list: protectedProcedure
		.input(taskFiltersSchema)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// クエリ条件構築
			const conditions = [eq(tasks.userId, userId)];

			if (input.status) {
				conditions.push(eq(tasks.status, input.status));
			}

			if (input.priority) {
				conditions.push(eq(tasks.priority, input.priority));
			}

			// 検索条件
			if (input.search) {
				const searchPattern = `%${input.search}%`;
				conditions.push(
					or(
						like(tasks.title, searchPattern),
						like(tasks.description, searchPattern)
					)!
				);
			}

			// ソート条件
			const orderBy = input.sortOrder === 'asc'
				? asc(tasks[input.sortBy])
				: desc(tasks[input.sortBy]);

			// クエリ実行
			const taskList = await db
				.select()
				.from(tasks)
				.where(and(...conditions))
				.orderBy(orderBy)
				.limit(input.limit)
				.offset(input.offset);

			return taskList;
		}),

	// タスク詳細取得
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const task = await db.query.tasks.findFirst({
				where: and(
					eq(tasks.id, input.id),
					eq(tasks.userId, userId)
				),
			});

			if (!task) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'タスクが見つかりません',
				});
			}

			return task;
		}),

	// タスク更新
	update: protectedProcedure
		.input(updateTaskSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { id, ...updates } = input;

			// 既存タスク取得
			const existingTask = await db.query.tasks.findFirst({
				where: and(
					eq(tasks.id, id),
					eq(tasks.userId, userId)
				),
			});

			if (!existingTask) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'タスクが見つかりません',
				});
			}

			// ステータス変更のバリデーション
			if (updates.status && updates.status !== existingTask.status) {
				validateStatusTransition(existingTask.status, updates.status);
			}

			// 完了時刻の自動設定
			const updateData: any = {
				...updates,
				updatedAt: new Date(),
			};

			if (updates.status && shouldSetCompletedAt(existingTask.status, updates.status)) {
				updateData.completedAt = new Date();
			}

			// 更新実行
			const updatedTask = await db
				.update(tasks)
				.set(updateData)
				.where(eq(tasks.id, id))
				.returning();

			return updatedTask[0];
		}),

	// タスク削除
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// タスク存在確認
			const existingTask = await db.query.tasks.findFirst({
				where: and(
					eq(tasks.id, input.id),
					eq(tasks.userId, userId)
				),
			});

			if (!existingTask) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'タスクが見つかりません',
				});
			}

			// ソフトデリート（ステータスをcancelledに変更）
			await db
				.update(tasks)
				.set({
					status: 'cancelled',
					updatedAt: new Date(),
				})
				.where(eq(tasks.id, input.id));

			return { success: true };
		}),

	// バッチ作成（オンボーディング用）
	batchCreate: protectedProcedure
		.input(z.object({
			tasks: z.array(z.object({
				title: z.string().min(1).max(200),
				estimatedMinutes: z.number().min(15).max(480),
				priority: z.enum(['high', 'medium', 'low']),
			})).min(1).max(3),
		}))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const now = new Date();

			// タスクを一括作成
			const createdTasks = await db.transaction(async (tx) => {
				const newTasks = await tx.insert(tasks).values(
					input.tasks.map(task => ({
						userId,
						title: task.title,
						estimatedDurationMinutes: task.estimatedMinutes,
						priority: task.priority,
						status: 'pending' as const,
						createdAt: now,
						updatedAt: now,
					}))
				).returning();

				// オンボーディング状態を更新
				await tx.insert(onboardingStates).values({
					userId,
					currentStep: 'completed',
					demoCompleted: true,
					firstTasksCreated: true,
					completedAt: now,
					updatedAt: now,
				}).onConflictDoUpdate({
					target: onboardingStates.userId,
					set: {
						firstTasksCreated: true,
						currentStep: 'completed',
						completedAt: now,
						updatedAt: now,
					},
				});

				return newTasks;
			});

			return {
				success: true,
				tasks: createdTasks,
			};
		}),
});
