# Task 6.1: 週次サマリー実装

**Epic**: Epic 6 - 分析とインサイト
**優先度**: Medium
**推定工数**: 3日

## 概要
週次の完了タスク数、作業時間、完了率をグラフで表示する。

## 技術要件

```typescript
// apps/server/src/routers/analytics.ts
export const analyticsRouter = router({
  getWeeklySummary: protectedProcedure
    .input(z.object({ startDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const endDate = new Date(input.startDate);
      endDate.setDate(endDate.getDate() + 7);

      const plans = await db.query.dailyPlans.findMany({
        where: and(
          eq(dailyPlans.userId, ctx.session.user.id),
          gte(dailyPlans.planDate, input.startDate),
          lt(dailyPlans.planDate, endDate)
        ),
        with: { timeBlocks: true },
      });

      const summary = {
        totalTasks: 0,
        completedTasks: 0,
        totalMinutes: 0,
        dailyBreakdown: plans.map(plan => ({
          date: plan.planDate,
          tasks: plan.timeBlocks.length,
          completed: plan.timeBlocks.filter(b => b.status === 'completed').length,
          minutes: plan.timeBlocks.reduce((sum, b) => sum + (b.actualDurationMinutes || 0), 0),
        })),
      };

      return summary;
    }),
});
```

## 受け入れ基準

- [ ] 週次データ集計API
- [ ] 日別推移グラフ表示
- [ ] 前週比表示

## 関連ドキュメント

- `specs/prd.md` - 週次サマリー要件
