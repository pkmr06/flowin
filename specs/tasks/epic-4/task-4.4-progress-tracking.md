# Task 4.4: 進捗トラッキングUI実装

**Epic**: Epic 4 - フォーカス実行モード
**User Story**: US-4.4, US-4.6
**優先度**: Critical
**推定工数**: 2日

## 概要
リアルタイム進捗表示と予定vs実際時間の比較を実装する。

## 技術要件

### Progress Display

```tsx
// apps/web/src/features/execution/ProgressDisplay.tsx
import { DailyPlan } from '@flowin/shared/types';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface ProgressDisplayProps {
  plan: DailyPlan;
}

export function ProgressDisplay({ plan }: ProgressDisplayProps) {
  const completed = plan.timeBlocks.filter(b => b.status === 'completed').length;
  const total = plan.timeBlocks.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  const totalPlanned = plan.totalPlannedMinutes;
  const totalActual = plan.timeBlocks
    .filter(b => b.actualDurationMinutes)
    .reduce((sum, b) => sum + (b.actualDurationMinutes || 0), 0);

  const variance = totalActual - totalPlanned;
  const varianceColor = Math.abs(variance) < totalPlanned * 0.2 ? 'text-green-600' : 'text-yellow-600';

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">進捗</span>
            <span>{completed}/{total} タスク</span>
          </div>
          <Progress value={percentage} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">予定時間</p>
            <p className="font-semibold">{Math.floor(totalPlanned / 60)}時間{totalPlanned % 60}分</p>
          </div>
          <div>
            <p className="text-muted-foreground">実際時間</p>
            <p className={`font-semibold ${varianceColor}`}>
              {Math.floor(totalActual / 60)}時間{totalActual % 60}分
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

## 受け入れ基準

- [ ] 進捗バーが正確に表示
- [ ] 完了数/総数が表示
- [ ] 予定vs実際時間を比較表示
- [ ] リアルタイムで更新

## 関連ドキュメント

- `specs/design-system.md` - プログレスバー仕様
