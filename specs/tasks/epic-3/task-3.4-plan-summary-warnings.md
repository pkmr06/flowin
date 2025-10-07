# Task 3.4: プランサマリーと警告UI実装

**Epic**: Epic 3 - デイリープランニング
**User Story**: US-3.2, US-3.4
**優先度**: Critical
**推定工数**: 2日

## 概要
合計時間表示、6時間超過警告、時間見積もり調整UIを実装する。

## 技術要件

### プランサマリー

#### 1. PlanSummary Component
```tsx
// apps/web/src/features/planning/PlanSummary.tsx
import { DailyPlan } from '@flowin/shared/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanSummaryProps {
  plan: DailyPlan | null;
  onFinalize: () => void;
}

export function PlanSummary({ plan, onFinalize }: PlanSummaryProps) {
  if (!plan) return null;

  const totalMinutes = plan.totalPlannedMinutes;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const isOverallocated = totalMinutes > 360;
  const taskCount = plan.timeBlocks?.length || 0;

  return (
    <Card className="p-6 sticky top-4">
      <h3 className="font-semibold mb-4">プランサマリー</h3>

      <div className="space-y-4">
        {/* タスク数 */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">タスク数</p>
          <p className="text-2xl font-bold">{taskCount}個</p>
        </div>

        {/* 合計時間 */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">合計作業時間</p>
          <p className="text-2xl font-bold">
            {totalHours}時間{remainingMinutes > 0 && `${remainingMinutes}分`}
          </p>
        </div>

        {/* 進捗バー */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>推奨: 6時間</span>
            <span className={cn(
              isOverallocated && "text-destructive font-medium"
            )}>
              {Math.round(totalMinutes / 360 * 100)}%
            </span>
          </div>
          <Progress
            value={Math.min(totalMinutes / 360 * 100, 100)}
            className={cn(
              isOverallocated && "[&>div]:bg-destructive"
            )}
          />
        </div>

        {/* 警告 */}
        {isOverallocated && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-destructive">作業時間超過</p>
              <p className="text-muted-foreground mt-1">
                推奨の6時間を{Math.round((totalMinutes - 360) / 60 * 10) / 10}時間超過しています。
                タスクを減らすか、時間を調整することをお勧めします。
              </p>
            </div>
          </div>
        )}

        {/* 確定ボタン */}
        <Button
          onClick={onFinalize}
          disabled={taskCount === 0}
          className="w-full"
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          プランを確定して開始
        </Button>
      </div>
    </Card>
  );
}
```

#### 2. Time Estimation Adjuster
```tsx
// apps/web/src/features/planning/TimeEstimationEditor.tsx
import { useState } from 'react';
import { TimeBlock } from '@flowin/shared/types';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface TimeEstimationEditorProps {
  block: TimeBlock;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

export function TimeEstimationEditor({ block, isOpen, onClose }: TimeEstimationEditorProps) {
  const [duration, setDuration] = useState(block.plannedDurationMinutes);
  const utils = trpc.useUtils();

  const updateMutation = trpc.dailyPlans.updateTimeBlock.useMutation({
    onSuccess: () => {
      utils.dailyPlans.getOrCreateToday.invalidate();
      onClose();
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: block.id,
      plannedDurationMinutes: duration,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>予想時間の調整</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>タスク</Label>
            <p className="font-medium mt-1">{block.task?.title}</p>
          </div>

          <div>
            <Label className="mb-3 block">予想時間</Label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_DURATIONS.map((min) => (
                <Button
                  key={min}
                  variant={duration === min ? "default" : "outline"}
                  onClick={() => setDuration(min)}
                >
                  {min < 60 ? `${min}分` : `${min / 60}時間`}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              キャンセル
            </Button>
            <Button onClick={handleSave} className="flex-1">
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 受け入れ基準チェックリスト

- [ ] タスク数が表示される
- [ ] 合計作業時間が表示される
- [ ] 進捗バーが正確に表示される
- [ ] 6時間超過で警告が表示される
- [ ] 時間見積もりを調整できる
- [ ] クイックピッカーで素早く設定できる
- [ ] 確定ボタンが適切に有効化/無効化される

## 依存関係

- Task 3.2（デイリープランAPI）
- Task 3.3（タスク選択UI）

## 関連ドキュメント

- `specs/prd.md` - プランニング要件
- `specs/design-system.md` - 警告UI仕様
