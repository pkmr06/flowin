# Task 3.1: デイリープランデータモデル実装

**Epic**: Epic 3 - デイリープランニング
**User Story**: US-3.1-3.5（基盤）
**優先度**: Critical
**推定工数**: 2日

## 概要
DailyPlanとTimeBlockエンティティのデータベーススキーマ定義と、関連するバリデーションロジックを実装する。

## 技術要件

### データベーススキーマ定義

#### 1. DailyPlanテーブル
```typescript
// apps/server/src/db/schema/daily-plans.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from './auth';
import { timeBlocks } from './time-blocks';
import { nanoid } from 'nanoid';

export const dailyPlans = sqliteTable('daily_plans', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

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
  user: one(users, {
    fields: [dailyPlans.userId],
    references: [users.id],
  }),
  timeBlocks: many(timeBlocks),
}));
```

#### 2. TimeBlockテーブル
```typescript
// apps/server/src/db/schema/time-blocks.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { dailyPlans } from './daily-plans';
import { tasks } from './tasks';
import { nanoid } from 'nanoid';

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
```

### バリデーションスキーマ

#### 3. Zodスキーマ定義
```typescript
// apps/server/src/validators/daily-plan.ts
import { z } from 'zod';

// 時刻フォーマット（HH:MM）
const timeFormatSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

// 日付フォーマット（YYYY-MM-DD）
const dateFormatSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createDailyPlanSchema = z.object({
  planDate: dateFormatSchema,
  workStartTime: timeFormatSchema.default('09:00'),
  workEndTime: timeFormatSchema.default('18:00'),
});

export const updateDailyPlanSchema = z.object({
  id: z.string(),
  workStartTime: timeFormatSchema.optional(),
  workEndTime: timeFormatSchema.optional(),
});

export const finalizeDailyPlanSchema = z.object({
  id: z.string(),
});

export const timeBlockStatusSchema = z.enum([
  'planned',
  'active',
  'completed',
  'skipped',
  'overrun'
]);

export const createTimeBlockSchema = z.object({
  dailyPlanId: z.string(),
  taskId: z.string(),
  startTime: z.date(),
  plannedDurationMinutes: z.number()
    .int()
    .min(15, '最小15分から設定できます')
    .max(480, '最大8時間まで設定できます'),
  sortOrder: z.number().int().min(0).default(0),
  notes: z.string().max(500).optional(),
});

export const updateTimeBlockSchema = z.object({
  id: z.string(),
  startTime: z.date().optional(),
  plannedDurationMinutes: z.number().int().min(15).max(480).optional(),
  sortOrder: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
  status: timeBlockStatusSchema.optional(),
  actualDurationMinutes: z.number().int().min(0).optional(),
});

export type CreateDailyPlanInput = z.infer<typeof createDailyPlanSchema>;
export type UpdateDailyPlanInput = z.infer<typeof updateDailyPlanSchema>;
export type CreateTimeBlockInput = z.infer<typeof createTimeBlockSchema>;
export type UpdateTimeBlockInput = z.infer<typeof updateTimeBlockSchema>;
```

### ビジネスロジック

#### 4. プランニングロジック
```typescript
// apps/server/src/lib/daily-plan-logic.ts
import { TRPCError } from '@trpc/server';

/**
 * 作業時間の合計を計算
 */
export function calculateTotalPlannedMinutes(
  timeBlocks: Array<{ plannedDurationMinutes: number }>
): number {
  return timeBlocks.reduce((sum, block) => sum + block.plannedDurationMinutes, 0);
}

/**
 * 6時間（360分）超過チェック
 */
export function checkOverallocation(totalMinutes: number): {
  isOverallocated: boolean;
  warningMessage?: string;
} {
  const RECOMMENDED_MAX_MINUTES = 360; // 6時間

  if (totalMinutes <= RECOMMENDED_MAX_MINUTES) {
    return { isOverallocated: false };
  }

  const hoursOver = Math.round((totalMinutes - RECOMMENDED_MAX_MINUTES) / 60 * 10) / 10;

  return {
    isOverallocated: true,
    warningMessage: `推奨作業時間（6時間）を${hoursOver}時間超過しています。タスクを減らすか、時間を調整することをお勧めします。`,
  };
}

/**
 * 時刻文字列から分を計算（"09:00" → 540）
 */
export function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 作業可能時間を計算
 */
export function calculateAvailableMinutes(
  workStartTime: string,
  workEndTime: string
): number {
  const startMinutes = timeStringToMinutes(workStartTime);
  const endMinutes = timeStringToMinutes(workEndTime);

  if (endMinutes <= startMinutes) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '終了時刻は開始時刻より後に設定してください',
    });
  }

  return endMinutes - startMinutes;
}

/**
 * タイムブロックの終了時刻を計算
 */
export function calculateEndTime(
  startTime: Date,
  durationMinutes: number
): Date {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);
  return endTime;
}

/**
 * タイムブロックの重複チェック
 */
export function checkTimeBlockOverlap(
  newBlock: { startTime: Date; endTime: Date },
  existingBlocks: Array<{ startTime: Date; endTime: Date }>
): boolean {
  return existingBlocks.some((block) => {
    return (
      (newBlock.startTime >= block.startTime && newBlock.startTime < block.endTime) ||
      (newBlock.endTime > block.startTime && newBlock.endTime <= block.endTime) ||
      (newBlock.startTime <= block.startTime && newBlock.endTime >= block.endTime)
    );
  });
}

/**
 * 今日の日付文字列を取得（YYYY-MM-DD）
 */
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
```

### マイグレーション

#### 5. マイグレーションファイル
```sql
-- apps/server/drizzle/migrations/0003_create_daily_plans.sql
CREATE TABLE IF NOT EXISTS daily_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_date TEXT NOT NULL,
  total_planned_minutes INTEGER NOT NULL DEFAULT 0,
  work_start_time TEXT NOT NULL DEFAULT '09:00',
  work_end_time TEXT NOT NULL DEFAULT '18:00',
  is_finalized INTEGER NOT NULL DEFAULT 0,
  finalized_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, plan_date)
);

CREATE INDEX daily_plans_user_id_idx ON daily_plans(user_id);
CREATE INDEX daily_plans_plan_date_idx ON daily_plans(plan_date);
CREATE INDEX daily_plans_user_date_idx ON daily_plans(user_id, plan_date);

CREATE TABLE IF NOT EXISTS time_blocks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  daily_plan_id TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  planned_duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'active', 'completed', 'skipped', 'overrun')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (daily_plan_id) REFERENCES daily_plans(id) ON DELETE CASCADE
);

CREATE INDEX time_blocks_daily_plan_id_idx ON time_blocks(daily_plan_id);
CREATE INDEX time_blocks_task_id_idx ON time_blocks(task_id);
CREATE INDEX time_blocks_status_idx ON time_blocks(status);
```

### 共有型定義

#### 6. 型エクスポート
```typescript
// packages/shared/src/types/daily-plan.ts
export interface DailyPlan {
  id: string;
  userId: string;
  planDate: string; // "2025-01-15"
  totalPlannedMinutes: number;
  workStartTime: string; // "09:00"
  workEndTime: string; // "18:00"
  isFinalized: boolean;
  finalizedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeBlock {
  id: string;
  taskId: string;
  dailyPlanId: string;
  startTime: Date;
  endTime: Date;
  plannedDurationMinutes: number;
  actualDurationMinutes?: number;
  sortOrder: number;
  notes?: string;
  status: 'planned' | 'active' | 'completed' | 'skipped' | 'overrun';
  createdAt: Date;
  updatedAt: Date;
}

export type TimeBlockStatus = TimeBlock['status'];

export interface DailyPlanWithBlocks extends DailyPlan {
  timeBlocks: TimeBlock[];
}

export interface OverallocationWarning {
  isOverallocated: boolean;
  warningMessage?: string;
}
```

## テスト要件

### ユニットテスト
```typescript
// apps/server/src/lib/daily-plan-logic.test.ts
describe('Daily Plan Logic', () => {
  describe('calculateTotalPlannedMinutes', () => {
    it('should sum all planned durations', () => {
      const blocks = [
        { plannedDurationMinutes: 30 },
        { plannedDurationMinutes: 60 },
        { plannedDurationMinutes: 45 },
      ];
      expect(calculateTotalPlannedMinutes(blocks)).toBe(135);
    });
  });

  describe('checkOverallocation', () => {
    it('should not warn for 6 hours or less', () => {
      const result = checkOverallocation(360);
      expect(result.isOverallocated).toBe(false);
    });

    it('should warn for over 6 hours', () => {
      const result = checkOverallocation(450); // 7.5 hours
      expect(result.isOverallocated).toBe(true);
      expect(result.warningMessage).toContain('1.5時間超過');
    });
  });

  describe('calculateAvailableMinutes', () => {
    it('should calculate work hours correctly', () => {
      expect(calculateAvailableMinutes('09:00', '18:00')).toBe(540); // 9 hours
      expect(calculateAvailableMinutes('10:30', '15:30')).toBe(300); // 5 hours
    });

    it('should throw for invalid time range', () => {
      expect(() => calculateAvailableMinutes('18:00', '09:00')).toThrow();
    });
  });

  describe('checkTimeBlockOverlap', () => {
    it('should detect overlapping blocks', () => {
      const newBlock = {
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
      };

      const existingBlocks = [{
        startTime: new Date('2025-01-15T10:30:00Z'),
        endTime: new Date('2025-01-15T11:30:00Z'),
      }];

      expect(checkTimeBlockOverlap(newBlock, existingBlocks)).toBe(true);
    });

    it('should allow non-overlapping blocks', () => {
      const newBlock = {
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
      };

      const existingBlocks = [{
        startTime: new Date('2025-01-15T11:00:00Z'),
        endTime: new Date('2025-01-15T12:00:00Z'),
      }];

      expect(checkTimeBlockOverlap(newBlock, existingBlocks)).toBe(false);
    });
  });
});
```

## 受け入れ基準チェックリスト

- [ ] DailyPlanテーブルが正しく定義されている
- [ ] TimeBlockテーブルが正しく定義されている
- [ ] リレーションが適切に設定されている
- [ ] インデックスが作成されている
- [ ] Zodバリデーションスキーマが全フィールドをカバー
- [ ] 合計時間計算ロジックが正確
- [ ] 6時間超過チェックが動作
- [ ] タイムブロック重複チェックが機能
- [ ] マイグレーションが生成できる
- [ ] 全ユニットテストが通る

## 依存関係

- Task 2.1（タスクデータモデル）
- Drizzle ORM
- Zod

## 実装順序

1. DailyPlanスキーマ定義
2. TimeBlockスキーマ定義
3. リレーション設定
4. Zodバリデーションスキーマ
5. ビジネスロジック実装
6. マイグレーション生成
7. 共有型定義エクスポート
8. ユニットテスト実装

## 関連ドキュメント

- `specs/data-model.md` - DailyPlan, TimeBlock エンティティ
- `specs/prd.md` - デイリープランニング要件
