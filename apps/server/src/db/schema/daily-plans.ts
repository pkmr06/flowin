import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { user } from './auth';

export const dailyPlans = sqliteTable('daily_plans', {
	id: text('id').primaryKey().$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	// 日付（YYYY-MM-DD形式）
	planDate: text('plan_date').notNull(), // "2025-01-15"

	// 作業時間設定
	totalPlannedMinutes: integer('total_planned_minutes')
		.notNull()
		.default(0),
	workStartTime: text('work_start_time').notNull().default('09:00'),
	workEndTime: text('work_end_time').notNull().default('18:00'),

	// 状態管理
	isFinalized: integer('is_finalized', { mode: 'boolean' })
		.notNull()
		.default(false),
	finalizedAt: integer('finalized_at', { mode: 'timestamp' }),

	// タイムスタンプ
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
}, (table) => ({
	userIdIdx: index('daily_plans_user_id_idx').on(table.userId),
	planDateIdx: index('daily_plans_plan_date_idx').on(table.planDate),
	userDateIdx: index('daily_plans_user_date_idx').on(table.userId, table.planDate),
}));

export const dailyPlansRelations = relations(dailyPlans, ({ one, many }) => ({
	user: one(user, {
		fields: [dailyPlans.userId],
		references: [user.id],
	}),
}));
