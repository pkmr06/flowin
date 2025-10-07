import { router, protectedProcedure } from '../lib/trpc';
import { z } from 'zod';
import { db } from '../db';
import { reflections } from '../db/schema/reflections';
import { eq, and } from 'drizzle-orm';
import {
	createReflectionSchema,
	updateReflectionSchema,
} from '../validators/reflection';
import { TRPCError } from '@trpc/server';

export const reflectionsRouter = router({
	// 振り返り作成
	create: protectedProcedure
		.input(createReflectionSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const reflection = await db.insert(reflections).values({
				userId,
				dailyPlanId: input.dailyPlanId,
				completedTasksCount: input.completedTasksCount,
				totalTasksCount: input.totalTasksCount,
				satisfactionRating: input.satisfactionRating,
				energyLevel: input.energyLevel,
				achievements: input.achievements,
				challenges: input.challenges,
				learnings: input.learnings,
				tomorrowPriorities: input.tomorrowPriorities,
				createdAt: new Date(),
				updatedAt: new Date(),
			}).returning();

			return reflection[0];
		}),

	// プランIDから振り返り取得
	getByPlanId: protectedProcedure
		.input(z.object({ dailyPlanId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const reflection = await db.query.reflections.findFirst({
				where: and(
					eq(reflections.dailyPlanId, input.dailyPlanId),
					eq(reflections.userId, userId)
				),
			});

			return reflection || null;
		}),

	// 振り返り更新
	update: protectedProcedure
		.input(updateReflectionSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { id, ...updates } = input;

			// 所有権確認
			const existing = await db.query.reflections.findFirst({
				where: and(
					eq(reflections.id, id),
					eq(reflections.userId, userId)
				),
			});

			if (!existing) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: '振り返りが見つかりません',
				});
			}

			// 更新
			const updated = await db
				.update(reflections)
				.set({
					...updates,
					updatedAt: new Date(),
				})
				.where(eq(reflections.id, id))
				.returning();

			return updated[0];
		}),

	// 最近の振り返り一覧取得
	getRecent: protectedProcedure
		.input(z.object({ limit: z.number().int().min(1).max(30).default(7) }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const recentReflections = await db.query.reflections.findMany({
				where: eq(reflections.userId, userId),
				orderBy: (reflections: any, { desc }: any) => [desc(reflections.createdAt)],
				limit: input.limit,
			});

			return recentReflections;
		}),
});
