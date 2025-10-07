# Task 4.1: タイマー実装

**Epic**: Epic 4 - フォーカス実行モード
**User Story**: US-4.1
**優先度**: Critical
**推定工数**: 3日

## 概要
WebWorkerベースの高精度タイマーと、タスク実行時間トラッキング機能を実装する。

## 技術要件

### WebWorkerタイマー

```typescript
// apps/web/src/workers/timer.worker.ts
let startTime: number | null = null;
let interval: number | null = null;

self.onmessage = (e: MessageEvent) => {
  const { type } = e.data;

  switch (type) {
    case 'START':
      startTime = Date.now();
      interval = setInterval(() => {
        if (startTime) {
          const elapsed = Date.now() - startTime;
          self.postMessage({ type: 'TICK', elapsed });
        }
      }, 1000) as unknown as number;
      break;

    case 'STOP':
      if (interval) clearInterval(interval);
      const elapsed = startTime ? Date.now() - startTime : 0;
      self.postMessage({ type: 'STOPPED', elapsed });
      startTime = null;
      interval = null;
      break;

    case 'RESET':
      startTime = Date.now();
      break;
  }
};
```

### Timerフック

```tsx
// apps/web/src/hooks/useTaskTimer.ts
import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';

export function useTaskTimer(taskId: string | null) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker>();
  const utils = trpc.useUtils();

  const startMutation = trpc.execution.startTask.useMutation();
  const pauseMutation = trpc.execution.pauseTask.useMutation();

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/timer.worker.ts', import.meta.url));

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'TICK') {
        setElapsedMs(e.data.elapsed);
      }
    };

    return () => workerRef.current?.terminate();
  }, []);

  const start = async () => {
    if (!taskId) return;
    await startMutation.mutateAsync({ taskId });
    workerRef.current?.postMessage({ type: 'START' });
    setIsRunning(true);
  };

  const stop = async () => {
    if (!taskId) return;
    workerRef.current?.postMessage({ type: 'STOP' });
    await pauseMutation.mutateAsync({ taskId, elapsedMs });
    setIsRunning(false);
    setElapsedMs(0);
  };

  return {
    elapsedMs,
    isRunning,
    start,
    stop,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    elapsedMinutes: Math.floor(elapsedMs / 60000),
  };
}
```

## 受け入れ基準

- [ ] タイマーが1秒単位で正確に動作
- [ ] WebWorkerでバックグラウンド計測
- [ ] 開始/停止が正常に動作
- [ ] 実行時間がサーバーに保存される
- [ ] 1タスクのみactive

## 依存関係

- Task 3.2（TimeBlock API）
- WebWorker API

## 関連ドキュメント

- `specs/prd.md` - タイマー要件
