import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { user } from './auth';

export const tasks = sqliteTable('tasks', {
	id: text('id').primaryKey().$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	// タスク情報
	title: text('title').notNull(),
	description: text('description'),

	// 時間管理
	estimatedDurationMinutes: integer('estimated_duration_minutes')
		.notNull()
		.default(30),
	actualDurationMinutes: integer('actual_duration_minutes'),

	// 優先度とステータス
	priority: text('priority', { enum: ['high', 'medium', 'low'] })
		.notNull()
		.default('medium'),
	status: text('status', {
		enum: ['pending', 'in_progress', 'completed', 'cancelled']
	})
		.notNull()
		.default('pending'),

	// タイムスタンプ
	completedAt: integer('completed_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
}, (table) => ({
	// パフォーマンス最適化用インデックス
	userIdIndex: index('tasks_user_id_idx').on(table.userId),
	statusIndex: index('tasks_status_idx').on(table.status),
	priorityIndex: index('tasks_priority_idx').on(table.priority),
	createdAtIndex: index('tasks_created_at_idx').on(table.createdAt),
	// 複合インデックス（よく使われるクエリ用）
	userStatusIndex: index('tasks_user_status_idx').on(table.userId, table.status),
}));

// リレーション定義
export const tasksRelations = relations(tasks, ({ one }) => ({
	user: one(user, {
		fields: [tasks.userId],
		references: [user.id],
	}),
}));

export const onboardingStates = sqliteTable('onboarding_states', {
	userId: text('user_id').primaryKey(),
	currentStep: text('current_step').notNull(),
	demoCompleted: integer('demo_completed', { mode: 'boolean' }).default(false).notNull(),
	firstTasksCreated: integer('first_tasks_created', { mode: 'boolean' }).default(false).notNull(),
	completedAt: integer('completed_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
