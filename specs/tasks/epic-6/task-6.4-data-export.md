# Task 6.4: データエクスポート実装

**Epic**: Epic 6 - 分析とインサイト
**優先度**: Low
**推定工数**: 3日

## 概要
タスクデータと振り返りデータをCSV/JSON形式でエクスポートする。

## 技術要件

```typescript
// apps/server/src/routers/export.ts
export const exportRouter = router({
  exportTasks: protectedProcedure
    .input(z.object({ format: z.enum(['csv', 'json']) }))
    .mutation(async ({ ctx, input }) => {
      const tasks = await db.query.tasks.findMany({
        where: eq(tasks.userId, ctx.session.user.id),
      });

      if (input.format === 'csv') {
        const csv = tasks.map(t => 
          `${t.title},${t.priority},${t.status},${t.estimatedDurationMinutes}`
        ).join('\n');
        return { data: csv, filename: 'tasks.csv' };
      }

      return { data: JSON.stringify(tasks, null, 2), filename: 'tasks.json' };
    }),
});
```

## 受け入れ基準

- [ ] タスクデータのCSVエクスポート
- [ ] 振り返りデータのJSONエクスポート
- [ ] ダウンロードボタンで取得
- [ ] GDPR準拠のデータポータビリティ

## 関連ドキュメント

- `specs/prd.md` - データエクスポート要件
