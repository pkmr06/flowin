# Task 4.5: タスク完了機能実装

**Epic**: Epic 4 - フォーカス実行モード
**User Story**: US-4.5
**優先度**: Critical
**推定工数**: 2日

## 概要
タスク完了ボタン、完了時刻記録、Undo機能を実装する。

## 技術要件

### Complete Task

```typescript
// apps/web/src/features/execution/useTaskCompletion.ts
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';

export function useTaskCompletion() {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const completeMutation = trpc.execution.completeTask.useMutation({
    onSuccess: () => {
      utils.dailyPlans.getOrCreateToday.invalidate();
      toast({
        title: 'タスク完了！',
        description: '次のタスクに進みましょう',
      });
    },
  });

  const complete = (taskId: string, actualMinutes: number) => {
    completeMutation.mutate({ taskId, actualMinutes });
  };

  return { complete, isLoading: completeMutation.isLoading };
}
```

## 受け入れ基準

- [ ] ワンクリックで完了
- [ ] 完了時刻が自動記録
- [ ] 実際の作業時間が記録
- [ ] 楽観的更新で即座に反映

## 関連ドキュメント

- `specs/prd.md` - タスク完了要件
