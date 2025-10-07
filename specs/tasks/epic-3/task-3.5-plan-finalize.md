# Task 3.5: プラン確定と実行モード遷移実装

**Epic**: Epic 3 - デイリープランニング
**User Story**: US-3.5
**優先度**: Critical
**推定工数**: 2日

## 概要
デイリープラン確定機能と、実行モードへの遷移を実装する。

## 技術要件

### プラン確定

#### 1. Finalize Logic
```tsx
// apps/web/src/features/planning/usePlanFinalize.ts
import { useNavigate } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';

export function usePlanFinalize() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const finalizeMutation = trpc.dailyPlans.finalize.useMutation({
    onSuccess: () => {
      toast({
        title: 'プランを確定しました',
        description: 'タスクを開始しましょう！',
      });
      navigate({ to: '/execution' });
    },
    onError: (error) => {
      toast({
        title: 'エラー',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFinalize = async () => {
    const plan = await utils.dailyPlans.getOrCreateToday.fetch();
    if (!plan) return;

    if (plan.timeBlocks.length === 0) {
      toast({
        title: 'タスクが未選択です',
        description: 'タスクを追加してから確定してください',
        variant: 'destructive',
      });
      return;
    }

    finalizeMutation.mutate({ id: plan.id });
  };

  return {
    finalize: handleFinalize,
    isLoading: finalizeMutation.isLoading,
  };
}
```

## 受け入れ基準チェックリスト

- [ ] プランが確定できる
- [ ] 確定後に実行モードへ遷移する
- [ ] 確定時刻が記録される
- [ ] 確定後も編集可能
- [ ] タスクがない場合はエラー表示

## 依存関係

- Task 3.2（デイリープランAPI）

## 関連ドキュメント

- `specs/prd.md` - プラン確定要件
