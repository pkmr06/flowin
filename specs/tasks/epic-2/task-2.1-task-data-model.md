# Task 2.1: タスクデータモデル実装

**Epic**: Epic 2 - タスク管理基盤
**User Story**: US-2.1-2.5（基盤）
**優先度**: Critical
**推定工数**: 2日

## 概要
Drizzle ORMを使用したタスクエンティティのデータベーススキーマ定義と、バリデーションロジックを実装する。全タスク管理機能の基盤となる。

## 技術要件

### データベーススキーマ定義

#### 1. タスクテーブル
```typescript
// apps/server/src/db/schema/tasks.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './auth';
import { nanoid } from 'nanoid';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

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
});

// リレーション定義
export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));
```

#### 2. インデックス定義
```typescript
// apps/server/src/db/schema/tasks.ts

// パフォーマンス最適化用インデックス
export const taskIndexes = {
  userIdIndex: index('tasks_user_id_idx').on(tasks.userId),
  statusIndex: index('tasks_status_idx').on(tasks.status),
  priorityIndex: index('tasks_priority_idx').on(tasks.priority),
  createdAtIndex: index('tasks_created_at_idx').on(tasks.createdAt),

  // 複合インデックス（よく使われるクエリ用）
  userStatusIndex: index('tasks_user_status_idx').on(
    tasks.userId,
    tasks.status
  ),
};
```

### バリデーションスキーマ

#### 3. Zodスキーマ定義
```typescript
// apps/server/src/validators/task.ts
import { z } from 'zod';

export const taskPrioritySchema = z.enum(['high', 'medium', 'low']);
export const taskStatusSchema = z.enum([
  'pending',
  'in_progress',
  'completed',
  'cancelled'
]);

export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string()
    .max(2000, '説明は2000文字以内で入力してください')
    .optional(),
  estimatedDurationMinutes: z.number()
    .int('整数で入力してください')
    .min(15, '最小15分から設定できます')
    .max(480, '最大8時間まで設定できます')
    .default(30),
  priority: taskPrioritySchema.default('medium'),
});

export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string()
    .min(1)
    .max(200)
    .optional(),
  description: z.string()
    .max(2000)
    .optional(),
  estimatedDurationMinutes: z.number()
    .int()
    .min(15)
    .max(480)
    .optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
});

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'title'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
```

### ステータス遷移ロジック

#### 4. 状態遷移バリデーション
```typescript
// apps/server/src/lib/task-status.ts
import { TRPCError } from '@trpc/server';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

const validTransitions: Record<TaskStatus, TaskStatus[]> = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // 完了後は変更不可
  cancelled: [], // キャンセル後は変更不可
};

export function validateStatusTransition(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): void {
  if (currentStatus === newStatus) {
    return; // 同じステータスへの変更は許可
  }

  const allowedTransitions = validTransitions[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `ステータスを ${currentStatus} から ${newStatus} に変更できません`,
    });
  }
}

export function shouldSetCompletedAt(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean {
  return newStatus === 'completed' && currentStatus !== 'completed';
}

export function calculateActualDuration(
  createdAt: Date,
  completedAt: Date
): number {
  const durationMs = completedAt.getTime() - createdAt.getTime();
  return Math.round(durationMs / 1000 / 60); // 分単位
}
```

### データベースマイグレーション

#### 5. マイグレーションファイル
```typescript
// apps/server/drizzle/migrations/0002_create_tasks_table.sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 30,
  actual_duration_minutes INTEGER,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_priority_idx ON tasks(priority);
CREATE INDEX tasks_created_at_idx ON tasks(created_at);
CREATE INDEX tasks_user_status_idx ON tasks(user_id, status);
```

### 型定義エクスポート

#### 6. 共有型定義
```typescript
// packages/shared/src/types/task.ts
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskPriority = Task['priority'];
export type TaskStatus = Task['status'];

export interface TaskSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}
```

## テスト要件

### ユニットテスト
```typescript
// apps/server/src/lib/task-status.test.ts
describe('Task Status Transitions', () => {
  it('should allow pending → in_progress', () => {
    expect(() => {
      validateStatusTransition('pending', 'in_progress');
    }).not.toThrow();
  });

  it('should allow in_progress → completed', () => {
    expect(() => {
      validateStatusTransition('in_progress', 'completed');
    }).not.toThrow();
  });

  it('should prevent completed → in_progress', () => {
    expect(() => {
      validateStatusTransition('completed', 'in_progress');
    }).toThrow('ステータスを completed から in_progress に変更できません');
  });

  it('should set completedAt when transitioning to completed', () => {
    expect(shouldSetCompletedAt('in_progress', 'completed')).toBe(true);
    expect(shouldSetCompletedAt('completed', 'completed')).toBe(false);
  });

  it('should calculate actual duration correctly', () => {
    const createdAt = new Date('2025-01-01T10:00:00Z');
    const completedAt = new Date('2025-01-01T11:30:00Z');
    expect(calculateActualDuration(createdAt, completedAt)).toBe(90);
  });
});
```

### スキーマテスト
```typescript
// apps/server/src/validators/task.test.ts
describe('Task Validation Schemas', () => {
  describe('createTaskSchema', () => {
    it('should validate valid task', () => {
      const result = createTaskSchema.safeParse({
        title: 'プレゼン資料作成',
        estimatedDurationMinutes: 60,
        priority: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const result = createTaskSchema.safeParse({
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid duration', () => {
      const result = createTaskSchema.safeParse({
        title: 'タスク',
        estimatedDurationMinutes: 5, // 最小15分未満
      });
      expect(result.success).toBe(false);
    });
  });
});
```

## 受け入れ基準チェックリスト

- [ ] タスクテーブルがDrizzleスキーマで定義されている
- [ ] 必須フィールド（title, userId, status, priority）が正しく設定
- [ ] インデックスが適切に作成されている
- [ ] Zodバリデーションスキーマが全フィールドをカバー
- [ ] ステータス遷移ロジックが正しく実装されている
- [ ] 完了時刻の自動設定が動作する
- [ ] マイグレーションファイルが生成できる
- [ ] 型定義が共有パッケージにエクスポートされている
- [ ] ユニットテストが全て通る

## 依存関係

- Drizzle ORM
- Zod
- Better-Auth（ユーザーID参照）

## 実装順序

1. タスクテーブルスキーマ定義
2. インデックス定義
3. Zodバリデーションスキーマ
4. ステータス遷移ロジック
5. マイグレーション生成
6. 共有型定義エクスポート
7. ユニットテスト実装

## 関連ドキュメント

- `specs/data-model.md` - Task エンティティ詳細
- `specs/prd.md` - タスク管理要件
- [Drizzle ORM Documentation](https://orm.drizzle.team)
