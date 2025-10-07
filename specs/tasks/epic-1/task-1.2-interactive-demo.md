# Task 1.2: インタラクティブデモ実装

**Epic**: Epic 1 - ユーザーオンボーディング  
**User Story**: US-1.2 - インタラクティブデモ  
**優先度**: Critical  
**推定工数**: 2日

## 概要
新規ユーザーが登録後すぐに体験できる30秒のインタラクティブデモを実装する。タスク追加→優先度設定→開始の基本フローを体験させる。

## 技術要件

### デモライブラリ選定

**選択**: Driver.js（軽量、カスタマイズ性高い）

```bash
bun add driver.js
```

### デモフロー設計

#### 1. デモステップ定義
```typescript
// apps/web/src/features/onboarding/demo-steps.ts
import { DriveStep } from 'driver.js';

export const demoSteps: DriveStep[] = [
  {
    element: '#welcome-message',
    popover: {
      title: 'Flowinへようこそ！',
      description: '30秒でFlowinの使い方を体験しましょう',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#add-task-button',
    popover: {
      title: 'タスクを追加',
      description: 'この「+」ボタンでタスクを追加できます。クリックしてみましょう！',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#task-title-input',
    popover: {
      title: 'タスク名を入力',
      description: '「プレゼン資料作成」など、今日やることを入力してください',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#priority-selector',
    popover: {
      title: '優先度を設定',
      description: '高・中・低から選択。重要なタスクは「高」にしましょう',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#save-task-button',
    popover: {
      title: 'タスクを保存',
      description: '保存ボタンでタスクリストに追加されます',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#task-list',
    popover: {
      title: 'タスク一覧',
      description: 'ここに追加したタスクが表示されます',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#start-task-button',
    popover: {
      title: 'タスクを開始',
      description: '「開始」ボタンでタイマーがスタート！集中して作業できます',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#progress-bar',
    popover: {
      title: '進捗を確認',
      description: '完了したタスクがリアルタイムで表示されます',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    popover: {
      title: 'デモ完了！',
      description: '実際にタスクを追加して始めましょう！',
      side: 'center',
      align: 'center',
    },
  },
];
```

#### 2. デモコンポーネント
```tsx
// apps/web/src/features/onboarding/InteractiveDemo.tsx
import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { demoSteps } from './demo-steps';
import { trpc } from '@/lib/trpc';

export function InteractiveDemo() {
  const [demoCompleted, setDemoCompleted] = useState(false);
  
  const completeDemoMutation = trpc.onboarding.completeDemo.useMutation();

  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      steps: demoSteps,
      onDestroyStarted: () => {
        // デモ完了を記録
        completeDemoMutation.mutate();
        setDemoCompleted(true);
        driverObj.destroy();
      },
      nextBtnText: '次へ',
      prevBtnText: '戻る',
      doneBtnText: '完了',
    });

    // 自動的にデモ開始
    driverObj.drive();

    return () => {
      driverObj.destroy();
    };
  }, []);

  return null; // デモはポップオーバーで表示されるため、JSX不要
}
```

#### 3. デモモック機能
```tsx
// apps/web/src/features/onboarding/DemoTaskProvider.tsx
import { createContext, useContext, useState } from 'react';

interface DemoTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
}

interface DemoContextType {
  tasks: DemoTask[];
  addTask: (task: Omit<DemoTask, 'id' | 'status'>) => void;
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoTaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<DemoTask[]>([]);

  const addTask = (task: Omit<DemoTask, 'id' | 'status'>) => {
    setTasks([...tasks, { 
      ...task, 
      id: `demo-${Date.now()}`, 
      status: 'pending' 
    }]);
  };

  const startTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: 'in_progress' as const } : t
    ));
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, status: 'completed' as const } : t
    ));
  };

  return (
    <DemoContext.Provider value={{ tasks, addTask, startTask, completeTask }}>
      {children}
    </DemoContext.Provider>
  );
}

export const useDemoTasks = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemoTasks must be used within DemoTaskProvider');
  return context;
};
```

#### 4. デモ統合ページ
```tsx
// apps/web/src/routes/onboarding/demo.tsx
import { InteractiveDemo } from '@/features/onboarding/InteractiveDemo';
import { DemoTaskProvider } from '@/features/onboarding/DemoTaskProvider';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';

export function OnboardingDemo() {
  return (
    <DemoTaskProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Flowin</h1>
            <Button variant="ghost" size="sm" id="skip-demo">
              スキップ
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div id="welcome-message" className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2">今日やることを整理しましょう</h2>
            <p className="text-muted-foreground">デモで基本的な使い方を学びます</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold">今日のタスク</h3>
              <Button id="add-task-button">
                <span className="text-xl mr-2">+</span>
                タスク追加
              </Button>
            </div>

            <div id="task-list">
              <TaskList isDemo />
            </div>

            <div id="progress-bar" className="mt-8">
              <div className="flex justify-between text-sm mb-2">
                <span>進捗</span>
                <span>0/0</span>
              </div>
              <div className="h-2 bg-secondary rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </main>

        <InteractiveDemo />
      </div>
    </DemoTaskProvider>
  );
}
```

### バックエンド実装

#### 5. オンボーディング状態管理
```typescript
// apps/server/src/routers/onboarding.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../db';
import { onboardingStates } from '../db/schema';

export const onboardingRouter = router({
  completeDemo: protectedProcedure
    .mutation(async ({ ctx }) => {
      await db.insert(onboardingStates).values({
        userId: ctx.session.user.id,
        currentStep: 'demo',
        demoCompleted: true,
        completedAt: new Date(),
      }).onConflictDoUpdate({
        target: onboardingStates.userId,
        set: {
          demoCompleted: true,
          currentStep: 'first_tasks',
          updatedAt: new Date(),
        },
      });

      return { success: true };
    }),

  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const status = await db.query.onboardingStates.findFirst({
        where: eq(onboardingStates.userId, ctx.session.user.id),
      });

      return status || {
        currentStep: 'demo',
        demoCompleted: false,
        firstTasksCreated: false,
      };
    }),
});
```

## スタイリング

```css
/* apps/web/src/styles/demo.css */
/* Driver.js カスタムスタイル */
.driver-popover {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.driver-popover-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: hsl(var(--foreground));
}

.driver-popover-description {
  font-size: var(--text-base);
  color: hsl(var(--muted-foreground));
}

.driver-popover-btn {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.driver-popover-btn:hover {
  background: hsl(var(--primary) / 0.9);
}
```

## テスト要件

### E2Eテスト
```typescript
// apps/web/tests/e2e/onboarding-demo.spec.ts
test('interactive demo flow', async ({ page }) => {
  await page.goto('/onboarding/demo');

  // デモポップオーバー表示確認
  await expect(page.locator('.driver-popover')).toBeVisible();
  await expect(page.locator('text=Flowinへようこそ')).toBeVisible();

  // ステップ進行
  await page.click('button:has-text("次へ")');
  await expect(page.locator('text=タスクを追加')).toBeVisible();

  // 全ステップ完了
  for (let i = 0; i < 7; i++) {
    await page.click('button:has-text("次へ")');
  }

  // 完了確認
  await page.click('button:has-text("完了")');
  await expect(page).toHaveURL('/onboarding/first-tasks');
});

test('demo skip functionality', async ({ page }) => {
  await page.goto('/onboarding/demo');
  
  // スキップボタンクリック
  await page.click('#skip-demo');
  
  // 次のステップへ遷移
  await expect(page).toHaveURL('/onboarding/first-tasks');
});
```

## 受け入れ基準チェックリスト

- [ ] 登録後すぐにデモモードに入る
- [ ] タスク追加→優先度設定→開始の基本フローを体験
- [ ] スキップ可能で、後から再度見られる
- [ ] モバイルでもスムーズに動作
- [ ] デモ完了状態がサーバーに保存される
- [ ] デザインシステムに準拠したスタイリング

## 依存関係

- Driver.js ライブラリ
- Task 1.1（認証完了後に表示）
- デモ用モックデータ

## 実装順序

1. Driver.js セットアップとスタイリング
2. デモステップ定義
3. デモモックタスク機能
4. オンボーディング状態管理API
5. デモページ統合
6. スキップ機能実装
7. テスト実装

## 関連ドキュメント

- [Driver.js Documentation](https://driverjs.com)
- `specs/design-system.md` - ポップオーバーUIガイドライン
- `specs/prd.md` - Entry Point & First-Time User Experience
