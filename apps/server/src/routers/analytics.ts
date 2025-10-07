import { router, protectedProcedure } from '../lib/trpc';
import { z } from 'zod';
import { db } from '../db';
import { dailyPlans } from '../db/schema/daily-plans';
import { timeBlocks } from '../db/schema/time-blocks';
import { tasks } from '../db/schema/tasks';
import { reflections } from '../db/schema/reflections';
import { eq, and, gte, lt } from 'drizzle-orm';

export const analyticsRouter = router({
	// 週次サマリー
	getWeeklySummary: protectedProcedure
		.input(z.object({
			startDate: z.string(), // YYYY-MM-DD
		}))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const start = new Date(input.startDate);
			const end = new Date(start);
			end.setDate(end.getDate() + 7);

			type DailyPlan = typeof dailyPlans.$inferSelect;
			type Task = typeof tasks.$inferSelect;

			const startStr = start.toISOString().split('T')[0];
			const endStr = end.toISOString().split('T')[0];

			// デイリープランを取得
			const plans = await db.query.dailyPlans.findMany({
				where: and(
					eq(dailyPlans.userId, userId),
					gte(dailyPlans.planDate, startStr),
					lt(dailyPlans.planDate, endStr)
				),
			});

			// 全タスクを取得
			const allTasks = await db.query.tasks.findMany({
				where: eq(tasks.userId, userId),
			});

			// 日別の集計
			const dailyBreakdown = plans.map((plan: DailyPlan) => {
				const planTasks = allTasks.filter((t: Task) =>
					t.createdAt.toISOString().split('T')[0] === plan.planDate
				);

				return {
					date: plan.planDate,
					tasks: planTasks.length,
					completed: planTasks.filter((t: Task) => t.status === 'completed').length,
					minutes: plan.totalPlannedMinutes,
				};
			});

			const totalTasks = dailyBreakdown.reduce((sum: number, day) => sum + day.tasks, 0);
			const completedTasks = dailyBreakdown.reduce((sum: number, day) => sum + day.completed, 0);
			const totalMinutes = dailyBreakdown.reduce((sum: number, day) => sum + day.minutes, 0);

			return {
				totalTasks,
				completedTasks,
				totalMinutes,
				completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
				dailyBreakdown,
			};
		}),

	// 完了率推移
	getCompletionTrend: protectedProcedure
		.input(z.object({
			days: z.number().int().min(7).max(90).default(30),
		}))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const end = new Date();
			const start = new Date();
			start.setDate(start.getDate() - input.days);

			type Task = typeof tasks.$inferSelect;

			const allTasks = await db.query.tasks.findMany({
				where: eq(tasks.userId, userId),
			});

			// 日別の完了率を計算
			const trend = [];
			for (let i = 0; i < input.days; i++) {
				const date = new Date(start);
				date.setDate(date.getDate() + i);
				const dateStr = date.toISOString().split('T')[0];

				const dayTasks = allTasks.filter((t: Task) =>
					t.createdAt.toISOString().split('T')[0] === dateStr
				);

				const completed = dayTasks.filter((t: Task) => t.status === 'completed').length;

				trend.push({
					date: dateStr,
					total: dayTasks.length,
					completed,
					completionRate: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0,
				});
			}

			return trend;
		}),

	// 時間配分分析
	getTimeAllocation: protectedProcedure
		.input(z.object({
			startDate: z.string(),
			endDate: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			type Task = typeof tasks.$inferSelect;

			const allTasks = await db.query.tasks.findMany({
				where: eq(tasks.userId, userId),
			});

			// 優先度別の時間集計
			const allocation: Record<'high' | 'medium' | 'low', number> = {
				high: 0,
				medium: 0,
				low: 0,
			};

			allTasks.forEach((task: Task) => {
				const priority = task.priority as 'high' | 'medium' | 'low';
				if (task.actualDurationMinutes) {
					allocation[priority] += task.actualDurationMinutes;
				} else {
					allocation[priority] += task.estimatedDurationMinutes;
				}
			});

			const total = allocation.high + allocation.medium + allocation.low;

			return [
				{
					priority: 'high',
					minutes: allocation.high,
					percentage: total > 0 ? Math.round((allocation.high / total) * 100) : 0,
					label: '高優先度',
				},
				{
					priority: 'medium',
					minutes: allocation.medium,
					percentage: total > 0 ? Math.round((allocation.medium / total) * 100) : 0,
					label: '中優先度',
				},
				{
					priority: 'low',
					minutes: allocation.low,
					percentage: total > 0 ? Math.round((allocation.low / total) * 100) : 0,
					label: '低優先度',
				},
			];
		}),

	// 満足度推移
	getSatisfactionTrend: protectedProcedure
		.input(z.object({
			days: z.number().int().min(7).max(90).default(30),
		}))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			type Reflection = typeof reflections.$inferSelect;

			const recentReflections = await db.query.reflections.findMany({
				where: eq(reflections.userId, userId),
				orderBy: (reflections: any, { desc }: any) => [desc(reflections.createdAt)],
				limit: input.days,
			});

			return recentReflections.map((r: Reflection) => ({
				date: r.createdAt.toISOString().split('T')[0],
				satisfaction: r.satisfactionRating,
				energy: r.energyLevel || 0,
			})).reverse();
		}),
});
