# Task 4.3: ポモドーロタイマー実装

**Epic**: Epic 4 - フォーカス実行モード
**User Story**: US-4.3
**優先度**: High
**推定工数**: 2日

## 概要
25分作業・5分休憩のポモドーロタイマーを実装し、適度な休憩を促す。

## 技術要件

### Pomodoro Hook

```typescript
// apps/web/src/hooks/usePomodoro.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function usePomodoro(workMinutes = 25, breakMinutes = 5) {
  const [phase, setPhase] = useState<'work' | 'break' | 'idle'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const { toast } = useToast();

  const startWork = () => {
    setPhase('work');
    setRemainingSeconds(workMinutes * 60);
  };

  const startBreak = () => {
    setPhase('break');
    setRemainingSeconds(breakMinutes * 60);
  };

  useEffect(() => {
    if (phase === 'idle' || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((s) => {
        if (s <= 1) {
          if (phase === 'work') {
            toast({ title: '休憩時間です！', description: '5分休憩しましょう' });
            startBreak();
          } else {
            toast({ title: '休憩終了', description: '作業を再開しましょう' });
            setPhase('idle');
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, remainingSeconds]);

  return {
    phase,
    remainingSeconds,
    startWork,
    startBreak,
    skip: () => setPhase('idle'),
  };
}
```

## 受け入れ基準

- [ ] 25分経過で休憩提案通知
- [ ] 5分休憩のカウントダウン
- [ ] 休憩スキップ可能
- [ ] 作業/休憩時間をカスタマイズ可能

## 関連ドキュメント

- `specs/prd.md` - ポモドーロ要件
