# Task 1.3: 初回タスク入力実装

**Epic**: Epic 1 - ユーザーオンボーディング  
**User Story**: US-1.3 - 初回タスク入力  
**優先度**: Critical  
**推定工数**: 2日

## 概要
デモ完了後、ユーザーに「今日の3つのタスク」を入力してもらい、即座に価値を実感できるようにする。フォーカスモードでの集中入力と自動保存機能を実装。

## 技術要件

### フロントエンド実装

#### 1. 初回タスク入力ページ
```tsx
// apps/web/src/routes/onboarding/first-tasks.tsx
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FirstTaskInput } from '@/features/onboarding/FirstTaskInput';
import { trpc } from '@/lib/trpc';

export function FirstTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Array<{
    title: string;
    estimatedMinutes: number;
    priority: 'high' | 'medium' | 'low';
  }>>([]);

  const createTasksMutation = trpc.tasks.batchCreate.useMutation({
    onSuccess: () => {
      navigate({ to: '/dashboard' });
    },
  });

  const handleComplete = () => {
    if (tasks.length >= 1) {
      createTasksMutation.mutate({ tasks });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">今日やることを3つ教えてください</h1>
          <p className="text-muted-foreground">
            まずは小さく始めましょう。3つのタスクから価値を実感できます
          </p>
        </header>

        <FirstTaskInput
          tasks={tasks}
          onTasksChange={setTasks}
          onComplete={handleComplete}
          isLoading={createTasksMutation.isLoading}
        />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>💡 ヒント: 2時間以内に完了できるタスクから始めるのがおすすめです</p>
        </div>
      </div>
    </div>
  );
}
```

#### 2. タスク入力コンポーネント
```tsx
// apps/web/src/features/onboarding/FirstTaskInput.tsx
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface Task {
  title: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
}

interface FirstTaskInputProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onComplete: () => void;
  isLoading: boolean;
}

export function FirstTaskInput({ tasks, onTasksChange, onComplete, isLoading }: FirstTaskInputProps) {
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    estimatedMinutes: 30,
    priority: 'medium',
  });

  const addTask = () => {
    if (currentTask.title && tasks.length < 3) {
      onTasksChange([...tasks, currentTask as Task]);
      setCurrentTask({
        title: '',
        estimatedMinutes: 30,
        priority: 'medium',
      });
    }
  };

  const removeTask = (index: number) => {
    onTasksChange(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* 追加済みタスク一覧 */}
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground">
                {task.estimatedMinutes}分 • {getPriorityLabel(task.priority)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeTask(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* 新規タスク入力 */}
      {tasks.length < 3 && (
        <div className="space-y-4 p-6 bg-accent/50 rounded-lg border-2 border-dashed border-border">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium mb-2">
              タスク {tasks.length + 1}
            </label>
            <Input
              id="task-title"
              value={currentTask.title || ''}
              onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
              placeholder="例: プレゼン資料を完成させる"
              className="text-lg"
              autoFocus={tasks.length === 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentTask.title) {
                  e.preventDefault();
                  addTask();
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">予想時間</label>
              <Select
                value={String(currentTask.estimatedMinutes)}
                onValueChange={(val) => setCurrentTask({ ...currentTask, estimatedMinutes: Number(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15分</SelectItem>
                  <SelectItem value="30">30分</SelectItem>
                  <SelectItem value="45">45分</SelectItem>
                  <SelectItem value="60">1時間</SelectItem>
                  <SelectItem value="90">1時間30分</SelectItem>
                  <SelectItem value="120">2時間</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">優先度</label>
              <Select
                value={currentTask.priority}
                onValueChange={(val) => setCurrentTask({ ...currentTask, priority: val as Task['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 高</SelectItem>
                  <SelectItem value="medium">🟡 中</SelectItem>
                  <SelectItem value="low">🟢 低</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={addTask}
            disabled={!currentTask.title}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            タスクを追加
          </Button>
        </div>
      )}

      {/* 完了ボタン */}
      <Button
        onClick={onComplete}
        disabled={tasks.length === 0 || isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? '保存中...' : `${tasks.length}個のタスクで始める`}
      </Button>
    </div>
  );
}

function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
  const labels = {
    high: '優先度: 高',
    medium: '優先度: 中',
    low: '優先度: 低',
  };
  return labels[priority];
}
```

### バックエンド実装

#### 3. バッチタスク作成API
```typescript
// apps/server/src/routers/tasks.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { tasks, onboardingStates } from '../db/schema';
import { nanoid } from 'nanoid';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  estimatedMinutes: z.number().min(15).max(480),
  priority: z.enum(['high', 'medium', 'low']),
});

export const tasksRouter = router({
  batchCreate: protectedProcedure
    .input(z.object({
      tasks: z.array(createTaskSchema).min(1).max(3),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const now = new Date();

      // タスクを一括作成
      const createdTasks = await db.transaction(async (tx) => {
        const taskRecords = input.tasks.map(task => ({
          id: nanoid(),
          userId,
          title: task.title,
          estimatedDurationMinutes: task.estimatedMinutes,
          priority: task.priority,
          status: 'pending' as const,
          createdAt: now,
          updatedAt: now,
        }));

        await tx.insert(tasks).values(taskRecords);

        // オンボーディング状態を更新
        await tx.insert(onboardingStates).values({
          userId,
          currentStep: 'completed',
          demoCompleted: true,
          firstTasksCreated: true,
          completedAt: now,
        }).onConflictDoUpdate({
          target: onboardingStates.userId,
          set: {
            firstTasksCreated: true,
            currentStep: 'completed',
            completedAt: now,
            updatedAt: now,
          },
        });

        return taskRecords;
      });

      return {
        success: true,
        tasks: createdTasks,
      };
    }),
});
```

### 自動保存機能

#### 4. 自動保存フック
```typescript
// apps/web/src/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => void | Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 500,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const debouncedData = useDebounce(data, delay);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 初回レンダリングはスキップ
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (enabled) {
      onSave(debouncedData);
    }
  }, [debouncedData, enabled]);
}

// apps/web/src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### 5. 自動保存統合
```tsx
// FirstTaskInput.tsx に追加
import { useAutoSave } from '@/hooks/useAutoSave';

export function FirstTaskInput({ tasks, onTasksChange, ... }: FirstTaskInputProps) {
  // ローカルストレージに自動保存
  useAutoSave({
    data: tasks,
    onSave: (data) => {
      localStorage.setItem('onboarding-tasks', JSON.stringify(data));
    },
    enabled: tasks.length > 0,
  });

  // 初回ロード時に復元
  useEffect(() => {
    const saved = localStorage.getItem('onboarding-tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        onTasksChange(parsed);
      } catch (e) {
        console.error('Failed to restore tasks', e);
      }
    }
  }, []);

  // ...
}
```

## テスト要件

### E2Eテスト
```typescript
// apps/web/tests/e2e/first-tasks.spec.ts
test('first tasks input flow', async ({ page }) => {
  await page.goto('/onboarding/first-tasks');

  // タスク1入力
  await page.fill('#task-title', 'プレゼン資料作成');
  await page.selectOption('select[name="estimatedMinutes"]', '60');
  await page.selectOption('select[name="priority"]', 'high');
  await page.click('button:has-text("タスクを追加")');

  // タスク追加確認
  await expect(page.locator('text=プレゼン資料作成')).toBeVisible();

  // タスク2入力
  await page.fill('#task-title', 'メール返信');
  await page.click('button:has-text("タスクを追加")');

  // タスク3入力
  await page.fill('#task-title', 'ミーティング準備');
  await page.click('button:has-text("タスクを追加")');

  // 完了ボタン有効化確認
  const completeButton = page.locator('button:has-text("3個のタスクで始める")');
  await expect(completeButton).toBeEnabled();

  // 保存実行
  await completeButton.click();

  // ダッシュボードへ遷移
  await expect(page).toHaveURL('/dashboard');
});

test('auto-save functionality', async ({ page }) => {
  await page.goto('/onboarding/first-tasks');

  // タスク入力
  await page.fill('#task-title', 'テストタスク');
  await page.click('button:has-text("タスクを追加")');

  // ページリロード
  await page.reload();

  // タスクが復元される
  await expect(page.locator('text=テストタスク')).toBeVisible();
});
```

## 受け入れ基準チェックリスト

- [ ] デモ完了後、タスク入力画面に遷移
- [ ] 3つのタスク入力を促すガイダンス表示
- [ ] フォーカスモードで集中入力できる
- [ ] 自動保存で入力途中のデータも保護
- [ ] 1つ以上のタスクで「始める」ボタンが有効化
- [ ] タスク削除機能が動作
- [ ] Enterキーでタスク追加できる

## 依存関係

- Task 1.2（デモ完了後に表示）
- タスク作成API
- ローカルストレージ

## 実装順序

1. タスク入力UIコンポーネント
2. バッチ作成API実装
3. 自動保存機能
4. フォームバリデーション
5. エラーハンドリング
6. テスト実装

## 関連ドキュメント

- `specs/prd.md` - Entry Point & First-Time User Experience
- `specs/design-system.md` - フォームUIガイドライン
- `specs/data-model.md` - Task エンティティ
