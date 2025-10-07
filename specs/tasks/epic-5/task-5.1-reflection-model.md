# Task 5.1: 振り返りデータモデル実装

**Epic**: Epic 5 - デイリー振り返り
**優先度**: High
**推定工数**: 2日

## 概要
Reflectionエンティティのデータベーススキーマとバリデーションを実装する。

## 技術要件

```typescript
// apps/server/src/db/schema/reflections.ts
export const reflections = sqliteTable('reflections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  dailyPlanId: text('daily_plan_id').notNull().references(() => dailyPlans.id),
  
  completedTasksCount: integer('completed_tasks_count').notNull(),
  totalTasksCount: integer('total_tasks_count').notNull(),
  satisfactionRating: integer('satisfaction_rating').notNull(), // 1-5
  energyLevel: integer('energy_level'), // 1-5
  
  achievements: text('achievements'),
  challenges: text('challenges'),
  learnings: text('learnings'),
  tomorrowPriorities: text('tomorrow_priorities'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

## 受け入れ基準

- [ ] Reflectionテーブルが定義されている
- [ ] バリデーションスキーマが実装されている
- [ ] DailyPlanとのリレーションが設定されている

## 関連ドキュメント

- `specs/data-model.md` - Reflection エンティティ
