# Task 3.2: デイリープランAPI実装

**Epic**: Epic 3 - デイリープランニング
**User Story**: US-3.1, US-3.5
**優先度**: Critical
**推定工数**: 3日

## 概要
tRPCを使用したデイリープラン作成・更新・確定APIと、タイムブロックCRUD APIを実装する。

## 技術要件

### tRPCルーター実装

#### 1. デイリープランルーター
```typescript
// apps/server/src/routers/daily-plans.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { dailyPlans, timeBlocks } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  createDailyPlanSchema,
  updateDailyPlanSchema,
  finalizeDailyPlanSchema,
  createTimeBlockSchema,
  updateTimeBlockSchema,
} from '../validators/daily-plan';
import {
  calculateTotalPlannedMinutes,
  checkOverallocation,
  calculateEndTime,
  getTodayDateString,
} from '../lib/daily-plan-logic';
import { TRPCError } from '@trpc/server';

export const dailyPlansRouter = router({
  // 今日のプランを取得または作成
  getOrCreateToday: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const today = getTodayDateString();

      // 既存のプランを検索
      let plan = await db.query.dailyPlans.findFirst({
        where: and(
          eq(dailyPlans.userId, userId),
          eq(dailyPlans.planDate, today)
        ),
        with: {
          timeBlocks: {
            with: {
              task: true,
            },
            orderBy: (timeBlocks, { asc }) => [asc(timeBlocks.sortOrder)],
          },
        },
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

        plan = { ...newPlan[0], timeBlocks: [] };
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
        with: {
          timeBlocks: {
            with: {
              task: true,
            },
            orderBy: (timeBlocks, { asc }) => [asc(timeBlocks.sortOrder)],
          },
        },
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

      // 所有権確認とタイムブロック取得
      const plan = await db.query.dailyPlans.findFirst({
        where: and(
          eq(dailyPlans.id, input.id),
          eq(dailyPlans.userId, userId)
        ),
        with: {
          timeBlocks: true,
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'デイリープランが見つかりません',
        });
      }

      if (plan.timeBlocks.length === 0) {
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
        with: {
          timeBlocks: true,
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'デイリープランが見つかりません',
        });
      }

      // 終了時刻を計算
      const endTime = calculateEndTime(input.startTime, input.plannedDurationMinutes);

      // タイムブロック作成
      const newBlock = await db.insert(timeBlocks).values({
        taskId: input.taskId,
        dailyPlanId: input.dailyPlanId,
        startTime: input.startTime,
        endTime,
        plannedDurationMinutes: input.plannedDurationMinutes,
        sortOrder: input.sortOrder,
        notes: input.notes,
        status: 'planned',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // プランの合計時間を更新
      const allBlocks = [...plan.timeBlocks, newBlock[0]];
      const totalMinutes = calculateTotalPlannedMinutes(allBlocks);

      await db
        .update(dailyPlans)
        .set({
          totalPlannedMinutes: totalMinutes,
          updatedAt: new Date(),
        })
        .where(eq(dailyPlans.id, input.dailyPlanId));

      return {
        timeBlock: newBlock[0],
        overallocationWarning: checkOverallocation(totalMinutes),
      };
    }),

  // タイムブロック更新
  updateTimeBlock: protectedProcedure
    .input(updateTimeBlockSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...updates } = input;

      // 所有権確認
      const block = await db.query.timeBlocks.findFirst({
        where: eq(timeBlocks.id, id),
        with: {
          dailyPlan: true,
        },
      });

      if (!block || block.dailyPlan.userId !== userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'タイムブロックが見つかりません',
        });
      }

      // 終了時刻の再計算
      const updateData: any = { ...updates, updatedAt: new Date() };

      if (updates.startTime || updates.plannedDurationMinutes) {
        const startTime = updates.startTime || block.startTime;
        const duration = updates.plannedDurationMinutes || block.plannedDurationMinutes;
        updateData.endTime = calculateEndTime(startTime, duration);
      }

      // 更新
      const updated = await db
        .update(timeBlocks)
        .set(updateData)
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

      return {
        timeBlock: updated[0],
        overallocationWarning: checkOverallocation(totalMinutes),
      };
    }),

  // タイムブロック削除
  removeTimeBlock: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // 所有権確認
      const block = await db.query.timeBlocks.findFirst({
        where: eq(timeBlocks.id, input.id),
        with: {
          dailyPlan: true,
        },
      });

      if (!block || block.dailyPlan.userId !== userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'タイムブロックが見つかりません',
        });
      }

      // 削除
      await db.delete(timeBlocks).where(eq(timeBlocks.id, input.id));

      // 合計時間を再計算
      const remainingBlocks = await db.query.timeBlocks.findMany({
        where: eq(timeBlocks.dailyPlanId, block.dailyPlanId),
      });

      const totalMinutes = calculateTotalPlannedMinutes(remainingBlocks);

      await db
        .update(dailyPlans)
        .set({
          totalPlannedMinutes: totalMinutes,
          updatedAt: new Date(),
        })
        .where(eq(dailyPlans.id, block.dailyPlanId));

      return { success: true };
    }),

  // タイムブロック順序変更
  reorderTimeBlocks: protectedProcedure
    .input(z.object({
      dailyPlanId: z.string(),
      blockIds: z.array(z.string()),
    }))
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

      // 順序を更新
      await Promise.all(
        input.blockIds.map((blockId, index) =>
          db
            .update(timeBlocks)
            .set({ sortOrder: index, updatedAt: new Date() })
            .where(eq(timeBlocks.id, blockId))
        )
      );

      return { success: true };
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
import { dailyPlansRouter } from './daily-plans';

export const appRouter = router({
  auth: authRouter,
  tasks: tasksRouter,
  onboarding: onboardingRouter,
  dailyPlans: dailyPlansRouter,
});

export type AppRouter = typeof appRouter;
```

## テスト要件

### 統合テスト
```typescript
// apps/server/src/routers/daily-plans.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from './index';
import { createTestContext } from '../test-utils';

describe('Daily Plans Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let userId: string;

  beforeEach(async () => {
    const ctx = await createTestContext();
    caller = appRouter.createCaller(ctx);
    userId = ctx.session.user.id;
  });

  describe('getOrCreateToday', () => {
    it('should create plan if not exists', async () => {
      const plan = await caller.dailyPlans.getOrCreateToday();

      expect(plan.id).toBeDefined();
      expect(plan.userId).toBe(userId);
      expect(plan.timeBlocks).toEqual([]);
    });

    it('should return existing plan', async () => {
      const plan1 = await caller.dailyPlans.getOrCreateToday();
      const plan2 = await caller.dailyPlans.getOrCreateToday();

      expect(plan1.id).toBe(plan2.id);
    });
  });

  describe('addTimeBlock', () => {
    it('should add time block to plan', async () => {
      const plan = await caller.dailyPlans.getOrCreateToday();
      const task = await caller.tasks.create({
        title: 'Test Task',
        estimatedDurationMinutes: 60,
      });

      const result = await caller.dailyPlans.addTimeBlock({
        dailyPlanId: plan.id,
        taskId: task.id,
        startTime: new Date('2025-01-15T09:00:00Z'),
        plannedDurationMinutes: 60,
        sortOrder: 0,
      });

      expect(result.timeBlock.id).toBeDefined();
      expect(result.timeBlock.plannedDurationMinutes).toBe(60);
      expect(result.overallocationWarning.isOverallocated).toBe(false);
    });

    it('should warn on overallocation', async () => {
      const plan = await caller.dailyPlans.getOrCreateToday();
      const task = await caller.tasks.create({
        title: 'Long Task',
        estimatedDurationMinutes: 480,
      });

      const result = await caller.dailyPlans.addTimeBlock({
        dailyPlanId: plan.id,
        taskId: task.id,
        startTime: new Date('2025-01-15T09:00:00Z'),
        plannedDurationMinutes: 480, // 8 hours
        sortOrder: 0,
      });

      expect(result.overallocationWarning.isOverallocated).toBe(true);
      expect(result.overallocationWarning.warningMessage).toContain('超過');
    });
  });

  describe('reorderTimeBlocks', () => {
    it('should reorder time blocks', async () => {
      const plan = await caller.dailyPlans.getOrCreateToday();
      const task1 = await caller.tasks.create({ title: 'Task 1', estimatedDurationMinutes: 30 });
      const task2 = await caller.tasks.create({ title: 'Task 2', estimatedDurationMinutes: 30 });

      const block1 = await caller.dailyPlans.addTimeBlock({
        dailyPlanId: plan.id,
        taskId: task1.id,
        startTime: new Date(),
        plannedDurationMinutes: 30,
        sortOrder: 0,
      });

      const block2 = await caller.dailyPlans.addTimeBlock({
        dailyPlanId: plan.id,
        taskId: task2.id,
        startTime: new Date(),
        plannedDurationMinutes: 30,
        sortOrder: 1,
      });

      // 順序を入れ替え
      await caller.dailyPlans.reorderTimeBlocks({
        dailyPlanId: plan.id,
        blockIds: [block2.timeBlock.id, block1.timeBlock.id],
      });

      const updatedPlan = await caller.dailyPlans.getByDate({ date: plan.planDate });
      expect(updatedPlan!.timeBlocks[0].id).toBe(block2.timeBlock.id);
      expect(updatedPlan!.timeBlocks[1].id).toBe(block1.timeBlock.id);
    });
  });

  describe('finalize', () => {
    it('should finalize plan with time blocks', async () => {
      const plan = await caller.dailyPlans.getOrCreateToday();
      const task = await caller.tasks.create({ title: 'Task', estimatedDurationMinutes: 30 });

      await caller.dailyPlans.addTimeBlock({
        dailyPlanId: plan.id,
        taskId: task.id,
        startTime: new Date(),
        plannedDurationMinutes: 30,
        sortOrder: 0,
      });

      const finalized = await caller.dailyPlans.finalize({ id: plan.id });

      expect(finalized.isFinalized).toBe(true);
      expect(finalized.finalizedAt).toBeInstanceOf(Date);
    });

    it('should reject finalize without time blocks', async () => {
      const plan = await caller.dailyPlans.getOrCreateToday();

      await expect(
        caller.dailyPlans.finalize({ id: plan.id })
      ).rejects.toThrow('タイムブロックが設定されていません');
    });
  });
});
```

## 受け入れ基準チェックリスト

- [ ] 今日のプラン取得/作成が動作
- [ ] 指定日のプラン取得が動作
- [ ] タイムブロック追加が成功
- [ ] タイムブロック更新で合計時間が再計算される
- [ ] タイムブロック削除が動作
- [ ] タイムブロック順序変更が動作
- [ ] 6時間超過で警告が返される
- [ ] プラン確定が正しく動作
- [ ] 他ユーザーのプランにアクセスできない
- [ ] 全統合テストが通る

## 依存関係

- Task 3.1（デイリープランデータモデル）
- Task 2.2（タスクCRUD API）

## 実装順序

1. デイリープランCRUD実装
2. タイムブロックCRUD実装
3. 合計時間計算と更新
4. 過剰割り当て警告
5. プラン確定ロジック
6. 順序変更機能
7. 統合テスト実装

## 関連ドキュメント

- `specs/prd.md` - デイリープランニングAPI要件
- `specs/data-model.md` - DailyPlan, TimeBlock
- [tRPC Documentation](https://trpc.io)
