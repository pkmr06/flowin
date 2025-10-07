# Task 2.2: タスクCRUD API実装

**Epic**: Epic 2 - タスク管理基盤
**User Story**: US-2.1, US-2.3
**優先度**: Critical
**推定工数**: 3日

## 概要
tRPCを使用したタスクの作成・取得・更新・削除APIを実装する。楽観的更新対応とエラーハンドリングを含む。

## 技術要件

### tRPCルーター実装

#### 1. タスクルーター
```typescript
// apps/server/src/routers/tasks.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { tasks } from '../db/schema';
import { eq, and, desc, asc, like, or } from 'drizzle-orm';
import {
  createTaskSchema,
  updateTaskSchema,
  taskFiltersSchema,
} from '../validators/task';
import {
  validateStatusTransition,
  shouldSetCompletedAt,
} from '../lib/task-status';
import { TRPCError } from '@trpc/server';

export const tasksRouter = router({
  // タスク作成
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const now = new Date();

      const newTask = await db.insert(tasks).values({
        userId,
        title: input.title,
        description: input.description,
        estimatedDurationMinutes: input.estimatedDurationMinutes,
        priority: input.priority,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }).returning();

      return newTask[0];
    }),

  // タスク一覧取得
  list: protectedProcedure
    .input(taskFiltersSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // クエリ条件構築
      const conditions = [eq(tasks.userId, userId)];

      if (input.status) {
        conditions.push(eq(tasks.status, input.status));
      }

      if (input.priority) {
        conditions.push(eq(tasks.priority, input.priority));
      }

      // 検索条件
      if (input.search) {
        const searchPattern = `%${input.search}%`;
        conditions.push(
          or(
            like(tasks.title, searchPattern),
            like(tasks.description, searchPattern)
          )!
        );
      }

      // ソート条件
      const orderBy = input.sortOrder === 'asc'
        ? asc(tasks[input.sortBy])
        : desc(tasks[input.sortBy]);

      // クエリ実行
      const taskList = await db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset);

      return taskList;
    }),

  // タスク詳細取得
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const task = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, input.id),
          eq(tasks.userId, userId)
        ),
      });

      if (!task) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'タスクが見つかりません',
        });
      }

      return task;
    }),

  // タスク更新
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updates } = input;

      // 既存タスク取得
      const existingTask = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, id),
          eq(tasks.userId, userId)
        ),
      });

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'タスクが見つかりません',
        });
      }

      // ステータス変更のバリデーション
      if (updates.status && updates.status !== existingTask.status) {
        validateStatusTransition(existingTask.status, updates.status);
      }

      // 完了時刻の自動設定
      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      };

      if (updates.status && shouldSetCompletedAt(existingTask.status, updates.status)) {
        updateData.completedAt = new Date();
      }

      // 更新実行
      const updatedTask = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();

      return updatedTask[0];
    }),

  // タスク削除
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // タスク存在確認
      const existingTask = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, input.id),
          eq(tasks.userId, userId)
        ),
      });

      if (!existingTask) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'タスクが見つかりません',
        });
      }

      // ソフトデリート（ステータスをcancelledに変更）
      await db
        .update(tasks)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, input.id));

      return { success: true };
    }),

  // 物理削除（管理用）
  hardDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await db
        .delete(tasks)
        .where(and(
          eq(tasks.id, input.id),
          eq(tasks.userId, userId)
        ));

      return { success: true };
    }),

  // タスクサマリー取得
  getSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const userTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId));

      const summary = {
        total: userTasks.length,
        pending: userTasks.filter(t => t.status === 'pending').length,
        inProgress: userTasks.filter(t => t.status === 'in_progress').length,
        completed: userTasks.filter(t => t.status === 'completed').length,
        cancelled: userTasks.filter(t => t.status === 'cancelled').length,
      };

      return summary;
    }),
});
```

#### 2. ルーター統合
```typescript
// apps/server/src/routers/index.ts
import { router } from '../trpc';
import { authRouter } from './auth';
import { tasksRouter } from './tasks';
import { onboardingRouter } from './onboarding';

export const appRouter = router({
  auth: authRouter,
  tasks: tasksRouter,
  onboarding: onboardingRouter,
});

export type AppRouter = typeof appRouter;
```

### エラーハンドリング

#### 3. カスタムエラー
```typescript
// apps/server/src/lib/errors.ts
import { TRPCError } from '@trpc/server';

export class TaskNotFoundError extends TRPCError {
  constructor(id: string) {
    super({
      code: 'NOT_FOUND',
      message: `タスク（ID: ${id}）が見つかりません`,
    });
  }
}

export class TaskValidationError extends TRPCError {
  constructor(message: string) {
    super({
      code: 'BAD_REQUEST',
      message,
    });
  }
}

export class TaskPermissionError extends TRPCError {
  constructor() {
    super({
      code: 'FORBIDDEN',
      message: 'このタスクにアクセスする権限がありません',
    });
  }
}
```

### ロギングとモニタリング

#### 4. ロギングミドルウェア
```typescript
// apps/server/src/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

// ロギングミドルウェア
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  console.log({
    type,
    path,
    durationMs,
    ok: result.ok,
  });

  return result;
});

// 認証ミドルウェア
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure.use(loggerMiddleware);
export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(isAuthed);
```

## テスト要件

### 統合テスト
```typescript
// apps/server/src/routers/tasks.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from './index';
import { createTestContext } from '../test-utils';

describe('Tasks Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let userId: string;

  beforeEach(async () => {
    const ctx = await createTestContext();
    caller = appRouter.createCaller(ctx);
    userId = ctx.session.user.id;
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const task = await caller.tasks.create({
        title: 'プレゼン資料作成',
        estimatedDurationMinutes: 60,
        priority: 'high',
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('プレゼン資料作成');
      expect(task.userId).toBe(userId);
      expect(task.status).toBe('pending');
    });

    it('should reject empty title', async () => {
      await expect(
        caller.tasks.create({
          title: '',
          estimatedDurationMinutes: 30,
        })
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should return user tasks only', async () => {
      await caller.tasks.create({ title: 'Task 1', estimatedDurationMinutes: 30 });
      await caller.tasks.create({ title: 'Task 2', estimatedDurationMinutes: 45 });

      const tasks = await caller.tasks.list({});
      expect(tasks).toHaveLength(2);
      expect(tasks.every(t => t.userId === userId)).toBe(true);
    });

    it('should filter by status', async () => {
      const task = await caller.tasks.create({ title: 'Task', estimatedDurationMinutes: 30 });
      await caller.tasks.update({ id: task.id, status: 'in_progress' });

      const pendingTasks = await caller.tasks.list({ status: 'pending' });
      const inProgressTasks = await caller.tasks.list({ status: 'in_progress' });

      expect(pendingTasks).toHaveLength(0);
      expect(inProgressTasks).toHaveLength(1);
    });

    it('should search by title', async () => {
      await caller.tasks.create({ title: 'プレゼン資料作成', estimatedDurationMinutes: 30 });
      await caller.tasks.create({ title: 'メール返信', estimatedDurationMinutes: 15 });

      const results = await caller.tasks.list({ search: 'プレゼン' });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('プレゼン資料作成');
    });
  });

  describe('update', () => {
    it('should update task fields', async () => {
      const task = await caller.tasks.create({
        title: 'Original',
        estimatedDurationMinutes: 30,
      });

      const updated = await caller.tasks.update({
        id: task.id,
        title: 'Updated',
        priority: 'high',
      });

      expect(updated.title).toBe('Updated');
      expect(updated.priority).toBe('high');
    });

    it('should set completedAt when status changes to completed', async () => {
      const task = await caller.tasks.create({ title: 'Task', estimatedDurationMinutes: 30 });
      await caller.tasks.update({ id: task.id, status: 'in_progress' });

      const completed = await caller.tasks.update({
        id: task.id,
        status: 'completed',
      });

      expect(completed.completedAt).toBeInstanceOf(Date);
    });

    it('should reject invalid status transition', async () => {
      const task = await caller.tasks.create({ title: 'Task', estimatedDurationMinutes: 30 });
      await caller.tasks.update({ id: task.id, status: 'completed' });

      await expect(
        caller.tasks.update({ id: task.id, status: 'in_progress' })
      ).rejects.toThrow('ステータスを completed から in_progress に変更できません');
    });
  });

  describe('delete', () => {
    it('should soft delete task (set to cancelled)', async () => {
      const task = await caller.tasks.create({ title: 'Task', estimatedDurationMinutes: 30 });
      await caller.tasks.delete({ id: task.id });

      const deletedTask = await caller.tasks.getById({ id: task.id });
      expect(deletedTask.status).toBe('cancelled');
    });

    it('should prevent deleting other user tasks', async () => {
      // Create task with different user context
      const otherCtx = await createTestContext({ userId: 'other-user' });
      const otherCaller = appRouter.createCaller(otherCtx);
      const otherTask = await otherCaller.tasks.create({
        title: 'Other User Task',
        estimatedDurationMinutes: 30,
      });

      await expect(
        caller.tasks.delete({ id: otherTask.id })
      ).rejects.toThrow('タスクが見つかりません');
    });
  });

  describe('getSummary', () => {
    it('should return correct task counts', async () => {
      await caller.tasks.create({ title: 'Task 1', estimatedDurationMinutes: 30 });
      const task2 = await caller.tasks.create({ title: 'Task 2', estimatedDurationMinutes: 30 });
      await caller.tasks.update({ id: task2.id, status: 'in_progress' });
      const task3 = await caller.tasks.create({ title: 'Task 3', estimatedDurationMinutes: 30 });
      await caller.tasks.update({ id: task3.id, status: 'completed' });

      const summary = await caller.tasks.getSummary();

      expect(summary.total).toBe(3);
      expect(summary.pending).toBe(1);
      expect(summary.inProgress).toBe(1);
      expect(summary.completed).toBe(1);
      expect(summary.cancelled).toBe(0);
    });
  });
});
```

## 受け入れ基準チェックリスト

- [ ] タスク作成APIが動作し、バリデーションが機能
- [ ] タスク一覧取得でフィルタリング・ソート・検索が可能
- [ ] タスク更新でステータス遷移バリデーションが動作
- [ ] タスク削除でソフトデリートが実行される
- [ ] 他ユーザーのタスクにアクセスできない
- [ ] 完了時刻が自動設定される
- [ ] エラーハンドリングが適切に機能
- [ ] ロギングが全エンドポイントで動作
- [ ] 全統合テストが通る

## 依存関係

- Task 2.1（データモデル）
- tRPC
- Drizzle ORM

## 実装順序

1. 基本CRUD操作実装
2. フィルタリング・ソート機能
3. エラーハンドリング
4. ロギングミドルウェア
5. 統合テスト実装
6. エッジケーステスト

## 関連ドキュメント

- `specs/prd.md` - API要件
- `specs/data-model.md` - データモデル詳細
- [tRPC Documentation](https://trpc.io)
