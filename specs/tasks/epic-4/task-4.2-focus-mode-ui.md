# Task 4.2: フォーカスモードUI実装

**Epic**: Epic 4 - フォーカス実行モード
**User Story**: US-4.2
**優先度**: Critical
**推定工数**: 3日

## 概要
実行中のタスクのみを全画面/上部固定で表示するフォーカスモードUIを実装する。

## 技術要件

### FocusBar Component

```tsx
// apps/web/src/features/execution/FocusBar.tsx
import { TimeBlock } from '@flowin/shared/types';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2 } from 'lucide-react';

interface FocusBarProps {
  activeBlock: TimeBlock;
  onComplete: () => void;
  isFocusMode: boolean;
  onToggleFocus: () => void;
}

export function FocusBar({ activeBlock, onComplete, isFocusMode, onToggleFocus }: FocusBarProps) {
  const { elapsedSeconds, start, stop, isRunning } = useTaskTimer(activeBlock.taskId);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return (
    <Card className="fixed top-0 left-0 right-0 z-50 p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-mono font-bold">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div>
            <h3 className="font-semibold">{activeBlock.task?.title}</h3>
            <p className="text-sm text-muted-foreground">
              予定: {activeBlock.plannedDurationMinutes}分
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={start}>開始</Button>
          ) : (
            <>
              <Button onClick={stop} variant="outline">一時停止</Button>
              <Button onClick={onComplete}>完了</Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFocus}
          >
            {isFocusMode ? <Minimize2 /> : <Maximize2 />}
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

## 受け入れ基準

- [ ] フォーカスモードで実行中タスクのみ表示
- [ ] タイマーが大きく見やすく表示
- [ ] ESCキーで通常モードに戻る
- [ ] アニメーション付きで切り替わる

## 依存関係

- Task 4.1（タイマー実装）

## 関連ドキュメント

- `specs/design-system.md` - フォーカスモードUI仕様
