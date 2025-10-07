# Task 5.2: 振り返りAPI実装

**Epic**: Epic 5 - デイリー振り返り
**優先度**: High
**推定工数**: 2日

## 概要
振り返り作成・更新APIを実装する。

## 技術要件

```typescript
// apps/server/src/routers/reflections.ts
export const reflectionsRouter = router({
  create: protectedProcedure
    .input(createReflectionSchema)
    .mutation(async ({ ctx, input }) => {
      const reflection = await db.insert(reflections).values({
        userId: ctx.session.user.id,
        dailyPlanId: input.dailyPlanId,
        completedTasksCount: input.completedTasksCount,
        totalTasksCount: input.totalTasksCount,
        satisfactionRating: input.satisfactionRating,
        energyLevel: input.energyLevel,
        achievements: input.achievements,
        challenges: input.challenges,
        learnings: input.learnings,
        tomorrowPriorities: input.tomorrowPriorities,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      return reflection[0];
    }),

  getByPlanId: protectedProcedure
    .input(z.object({ dailyPlanId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db.query.reflections.findFirst({
        where: and(
          eq(reflections.dailyPlanId, input.dailyPlanId),
          eq(reflections.userId, ctx.session.user.id)
        ),
      });
    }),
});
```

## 受け入れ基準

- [ ] 振り返り作成APIが動作
- [ ] 振り返り取得APIが動作
- [ ] 所有権チェックが機能

## 関連ドキュメント

- `specs/prd.md` - 振り返りAPI要件
