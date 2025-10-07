import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { user } from './auth';
import { dailyPlans } from './daily-plans';

export const reflections = sqliteTable('reflections', {
	id: text('id').primaryKey().$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	dailyPlanId: text('daily_plan_id')
		.notNull()
		.references(() => dailyPlans.id, { onDelete: 'cascade' }),

	completedTasksCount: integer('completed_tasks_count').notNull(),
	totalTasksCount: integer('total_tasks_count').notNull(),
	satisfactionRating: integer('satisfaction_rating').notNull(), // 1-5
	energyLevel: integer('energy_level'), // 1-5

	achievements: text('achievements'),
	challenges: text('challenges'),
	learnings: text('learnings'),
	tomorrowPriorities: text('tomorrow_priorities'),

	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
}, (table) => ({
	userIdIdx: index('reflections_user_id_idx').on(table.userId),
	dailyPlanIdIdx: index('reflections_daily_plan_id_idx').on(table.dailyPlanId),
}));

export const reflectionsRelations = relations(reflections, ({ one }) => ({
	user: one(user, {
		fields: [reflections.userId],
		references: [user.id],
	}),
	dailyPlan: one(dailyPlans, {
		fields: [reflections.dailyPlanId],
		references: [dailyPlans.id],
	}),
}));
