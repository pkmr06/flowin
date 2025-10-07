import { router, protectedProcedure } from '../lib/trpc';
import { z } from 'zod';
import { db } from '../db';
import { dailyPlans } from '../db/schema/daily-plans';
import { timeBlocks } from '../db/schema/time-blocks';
import { eq, and } from 'drizzle-orm';
import {
	createDailyPlanSchema,
	updateDailyPlanSchema,
	finalizeDailyPlanSchema,
	createTimeBlockSchema,
	updateTimeBlockSchema,
} from '../validators/daily-plan';
import {
	calculateTotalPlannedMinutes,
	getDateString,
} from '../lib/daily-plan-logic';
import { TRPCError } from '@trpc/server';

export const dailyPlansRouter = router({
	// 今日のプランを取得または作成
	getOrCreateToday: protectedProcedure
		.query(async ({ ctx }) => {
			const userId = ctx.session.user.id;
			const today = getDateString(new Date());

			// 既存のプランを検索
			let plan = await db.query.dailyPlans.findFirst({
				where: and(
					eq(dailyPlans.userId, userId),
					eq(dailyPlans.planDate, today)
				),
			});

			// なければ作成
			if (!plan) {
				const newPlan = await db.insert(dailyPlans).values({
					userId,
					planDate: today,
					totalPlannedMinutes: 0,
					workStartTime: '09:00',
					workEndTime: '18:00',
					isFinalized: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				}).returning();

				plan = newPlan[0];
			}

			return plan;
		}),

	// 指定日のプランを取得
	getByDate: protectedProcedure
		.input(z.object({ date: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const plan = await db.query.dailyPlans.findFirst({
				where: and(
					eq(dailyPlans.userId, userId),
					eq(dailyPlans.planDate, input.date)
				),
			});

			return plan || null;
		}),

	// プラン更新
	update: protectedProcedure
		.input(updateDailyPlanSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { id, ...updates } = input;

			// 所有権確認
			const existingPlan = await db.query.dailyPlans.findFirst({
				where: and(
					eq(dailyPlans.id, id),
					eq(dailyPlans.userId, userId)
				),
			});

			if (!existingPlan) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'デイリープランが見つかりません',
				});
			}

			// 更新
			const updated = await db
				.update(dailyPlans)
				.set({
					...updates,
					updatedAt: new Date(),
				})
				.where(eq(dailyPlans.id, id))
				.returning();

			return updated[0];
		}),

	// プラン確定
	finalize: protectedProcedure
		.input(finalizeDailyPlanSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// 所有権確認
			const plan = await db.query.dailyPlans.findFirst({
				where: and(
					eq(dailyPlans.id, input.id),
					eq(dailyPlans.userId, userId)
				),
			});

			if (!plan) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'デイリープランが見つかりません',
				});
			}

			// タイムブロック確認
			const blocks = await db.query.timeBlocks.findMany({
				where: eq(timeBlocks.dailyPlanId, input.id),
			});

			if (blocks.length === 0) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'タイムブロックが設定されていません',
				});
			}

			// 確定
			const finalized = await db
				.update(dailyPlans)
				.set({
					isFinalized: true,
					finalizedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(dailyPlans.id, input.id))
				.returning();

			return finalized[0];
		}),

	// タイムブロック追加
	addTimeBlock: protectedProcedure
		.input(createTimeBlockSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// プラン所有権確認
			const plan = await db.query.dailyPlans.findFirst({
				where: and(
					eq(dailyPlans.id, input.dailyPlanId),
					eq(dailyPlans.userId, userId)
				),
			});

			if (!plan) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'デイリープランが見つかりません',
				});
			}

			if (plan.isFinalized) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: '確定済みのプランは編集できません',
				});
			}

			// 終了時刻を計算
			const endTime = new Date(input.startTime);
			endTime.setMinutes(endTime.getMinutes() + input.plannedDurationMinutes);

			// タイムブロック作成
			const newBlock = await db.insert(timeBlocks).values({
				taskId: input.taskId,
				dailyPlanId: input.dailyPlanId,
				startTime: input.startTime,
				endTime: endTime,
				plannedDurationMinutes: input.plannedDurationMinutes,
				sortOrder: input.sortOrder,
				notes: input.notes,
				status: 'planned',
				createdAt: new Date(),
				updatedAt: new Date(),
			}).returning();

			// 合計時間を再計算して更新
			const allBlocks = await db.query.timeBlocks.findMany({
				where: eq(timeBlocks.dailyPlanId, input.dailyPlanId),
			});

			const totalMinutes = calculateTotalPlannedMinutes(allBlocks);

			await db
				.update(dailyPlans)
				.set({
					totalPlannedMinutes: totalMinutes,
					updatedAt: new Date(),
				})
				.where(eq(dailyPlans.id, input.dailyPlanId));

			return newBlock[0];
		}),

	// タイムブロック更新
	updateTimeBlock: protectedProcedure
		.input(updateTimeBlockSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const { id, ...updates } = input;

			// タイムブロック取得と所有権確認
			const block = await db.query.timeBlocks.findFirst({
				where: eq(timeBlocks.id, id),
			});

			if (!block) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'タイムブロックが見つかりません',
				});
			}

			const plan = await db.query.dailyPlans.findFirst({
				where: and(
					eq(dailyPlans.id, block.dailyPlanId),
					eq(dailyPlans.userId, userId)
				),
			});

			if (!plan) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'デイリープランが見つかりません',
				});
			}

			// 終了時刻の再計算
			let endTime = block.endTime;
			if (updates.startTime || updates.plannedDurationMinutes) {
				const newStartTime = updates.startTime || block.startTime;
				const newDuration = updates.plannedDurationMinutes || block.plannedDurationMinutes;
				endTime = new Date(newStartTime);
				endTime.setMinutes(endTime.getMinutes() + newDuration);
			}

			// 更新
			const updated = await db
				.update(timeBlocks)
				.set({
					...updates,
					endTime,
					updatedAt: new Date(),
				})
				.where(eq(timeBlocks.id, id))
				.returning();

			// 合計時間を再計算
			const allBlocks = await db.query.timeBlocks.findMany({
				where: eq(timeBlocks.dailyPlanId, block.dailyPlanId),
			});

			const totalMinutes = calculateTotalPlannedMinutes(allBlocks);

			await db
				.update(dailyPlans)
				.set({
					totalPlannedMinutes: totalMinutes,
					updatedAt: new Date(),
				})
				.where(eq(dailyPlans.id, block.dailyPlanId));

			return updated[0];
		}),

	// タイムブロック削除
	deleteTimeBlock: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// タイムブロック取得と所有権確認
			const block = await db.query.timeBlocks.findFirst({
				where: eq(timeBlocks.id, input.id),
			});

			if (!block) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'タイムブロックが見つかりません',
				});
			}

			const plan = await db.query.dailyPlans.findFirst({
				where: and(
					eq(dailyPlans.id, block.dailyPlanId),
					eq(dailyPlans.userId, userId)
				),
			});

			if (!plan) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'デイリープランが見つかりません',
				});
			}

			// 削除
			await db.delete(timeBlocks).where(eq(timeBlocks.id, input.id));

			// 合計時間を再計算
			const allBlocks = await db.query.timeBlocks.findMany({
				where: eq(timeBlocks.dailyPlanId, block.dailyPlanId),
			});

			const totalMinutes = calculateTotalPlannedMinutes(allBlocks);

			await db
				.update(dailyPlans)
				.set({
					totalPlannedMinutes: totalMinutes,
					updatedAt: new Date(),
				})
				.where(eq(dailyPlans.id, block.dailyPlanId));

			return { success: true };
		}),
});
