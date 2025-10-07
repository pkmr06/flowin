import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { dailyPlans } from './daily-plans';
import { tasks } from './tasks';

export const timeBlocks = sqliteTable('time_blocks', {
	id: text('id').primaryKey().$defaultFn(() => nanoid()),
	taskId: text('task_id')
		.notNull()
		.references(() => tasks.id, { onDelete: 'cascade' }),
	dailyPlanId: text('daily_plan_id')
		.notNull()
		.references(() => dailyPlans.id, { onDelete: 'cascade' }),

	// 時間設定
	startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
	endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
	plannedDurationMinutes: integer('planned_duration_minutes').notNull(),
	actualDurationMinutes: integer('actual_duration_minutes'),

	// 順序（タイムブロックの並び順）
	sortOrder: integer('sort_order').notNull().default(0),

	// メモと状態
	notes: text('notes'),
	status: text('status', {
		enum: ['planned', 'active', 'completed', 'skipped', 'overrun']
	})
		.notNull()
		.default('planned'),

	// タイムスタンプ
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
}, (table) => ({
	dailyPlanIdIdx: index('time_blocks_daily_plan_id_idx').on(table.dailyPlanId),
	taskIdIdx: index('time_blocks_task_id_idx').on(table.taskId),
	statusIdx: index('time_blocks_status_idx').on(table.status),
}));

export const timeBlocksRelations = relations(timeBlocks, ({ one }) => ({
	dailyPlan: one(dailyPlans, {
		fields: [timeBlocks.dailyPlanId],
		references: [dailyPlans.id],
	}),
	task: one(tasks, {
		fields: [timeBlocks.taskId],
		references: [tasks.id],
	}),
}));
