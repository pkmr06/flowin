# Task 2.3: タスク一覧UI実装

**Epic**: Epic 2 - タスク管理基盤
**User Story**: US-2.2
**優先度**: Critical
**推定工数**: 2日

## 概要
タスク一覧表示コンポーネントを実装し、フィルタリング・ソート・検索機能を提供する。仮想スクロールで大量タスクにも対応。

## 技術要件

### タスク一覧コンポーネント

#### 1. TaskListページ
```tsx
// apps/web/src/routes/tasks/index.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TaskList } from '@/features/tasks/TaskList';
import { TaskFilters } from '@/features/tasks/TaskFilters';
import { TaskCreateButton } from '@/features/tasks/TaskCreateButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

export function TasksPage() {
  const [filters, setFilters] = useState({
    status: undefined,
    priority: undefined,
    search: '',
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  });

  const { data: tasks, isLoading } = trpc.tasks.list.useQuery(filters);
  const { data: summary } = trpc.tasks.getSummary.useQuery();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">タスク</h1>
          {summary && (
            <p className="text-muted-foreground">
              {summary.pending}個の未着手 • {summary.inProgress}個進行中 • {summary.completed}個完了
            </p>
          )}
        </div>
        <TaskCreateButton />
      </div>

      {/* フィルター＆検索 */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="タスクを検索..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      {/* タスク一覧 */}
      <TaskList
        tasks={tasks || []}
        isLoading={isLoading}
      />
    </div>
  );
}
```

#### 2. TaskListコンポーネント
```tsx
// apps/web/src/features/tasks/TaskList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { TaskItem } from './TaskItem';
import { Task } from '@flowin/shared/types';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function TaskList({ tasks, isLoading }: TaskListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // 仮想スクロール設定
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // タスクアイテムの推定高さ
    overscan: 5, // 画面外の事前レンダリング数
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">タスクがありません</p>
        <TaskCreateButton variant="default" />
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-300px)] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const task = tasks[virtualItem.index];
          return (
            <div
              key={task.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TaskItem task={task} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### 3. TaskItemコンポーネント
```tsx
// apps/web/src/features/tasks/TaskItem.tsx
import { Task } from '@flowin/shared/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.tasks.update.useMutation({
    // 楽観的更新
    onMutate: async (newTask) => {
      await utils.tasks.list.cancel();
      const previousTasks = utils.tasks.list.getData();

      utils.tasks.list.setData(undefined, (old) =>
        old?.map((t) => (t.id === newTask.id ? { ...t, ...newTask } : t))
      );

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      utils.tasks.list.setData(undefined, context?.previousTasks);
    },
    onSettled: () => {
      utils.tasks.list.invalidate();
    },
  });

  const handleCheckToggle = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateMutation.mutate({
      id: task.id,
      status: newStatus,
    });
  };

  return (
    <Card
      className={cn(
        'p-4 mb-3 hover:shadow-md transition-shadow',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* チェックボックス */}
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={handleCheckToggle}
          className="mt-1"
        />

        {/* タスク情報 */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-medium mb-1',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedDurationMinutes}分</span>
            </div>
          </div>
        </div>

        {/* アクションメニュー */}
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
```

#### 4. フィルターコンポーネント
```tsx
// apps/web/src/features/tasks/TaskFilters.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';

interface TaskFiltersProps {
  filters: {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'high' | 'medium' | 'low';
    sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'title';
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: any) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          フィルター
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>ステータス</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? undefined : value,
            })
          }
        >
          <DropdownMenuRadioItem value="all">すべて</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="pending">未着手</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="in_progress">進行中</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="completed">完了</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>優先度</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={filters.priority || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              priority: value === 'all' ? undefined : value,
            })
          }
        >
          <DropdownMenuRadioItem value="all">すべて</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="high">高</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="medium">中</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="low">低</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>並び順</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={filters.sortBy}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, sortBy: value })
          }
        >
          <DropdownMenuRadioItem value="createdAt">作成日時</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="updatedAt">更新日時</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="priority">優先度</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title">タイトル</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 5. バッジコンポーネント
```tsx
// apps/web/src/features/tasks/PriorityBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const variants = {
    high: { label: '高', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    medium: { label: '中', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    low: { label: '低', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  };

  const variant = variants[priority];

  return (
    <Badge variant="secondary" className={cn('text-xs', variant.className)}>
      {variant.label}
    </Badge>
  );
}

// apps/web/src/features/tasks/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: { label: '未着手', className: 'bg-neutral-100 text-neutral-600' },
    in_progress: { label: '進行中', className: 'bg-blue-100 text-blue-800' },
    completed: { label: '完了', className: 'bg-green-100 text-green-800' },
    cancelled: { label: 'キャンセル', className: 'bg-gray-100 text-gray-600' },
  };

  const variant = variants[status];

  return (
    <Badge variant="secondary" className={cn('text-xs', variant.className)}>
      {variant.label}
    </Badge>
  );
}
```

## テスト要件

### コンポーネントテスト
```typescript
// apps/web/src/features/tasks/TaskList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { TaskList } from './TaskList';
import { Task } from '@flowin/shared/types';

const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'プレゼン資料作成',
    estimatedDurationMinutes: 60,
    priority: 'high',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'メール返信',
    estimatedDurationMinutes: 15,
    priority: 'low',
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('TaskList', () => {
  it('should render tasks', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText('プレゼン資料作成')).toBeInTheDocument();
    expect(screen.getByText('メール返信')).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    render(<TaskList tasks={[]} isLoading />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(5);
  });

  it('should show empty state', () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });
});
```

### E2Eテスト
```typescript
// apps/web/tests/e2e/task-list.spec.ts
test('task list filtering and search', async ({ page }) => {
  await page.goto('/tasks');

  // 初期表示確認
  await expect(page.locator('text=タスク')).toBeVisible();

  // 検索
  await page.fill('input[placeholder*="検索"]', 'プレゼン');
  await expect(page.locator('text=プレゼン資料作成')).toBeVisible();
  await expect(page.locator('text=メール返信')).not.toBeVisible();

  // フィルター
  await page.click('button:has-text("フィルター")');
  await page.click('text=高');

  await expect(page.locator('[data-priority="high"]')).toBeVisible();
});

test('task completion toggle', async ({ page }) => {
  await page.goto('/tasks');

  const taskCheckbox = page.locator('[data-task-id="1"] input[type="checkbox"]');

  // 完了マーク
  await taskCheckbox.check();
  await expect(taskCheckbox).toBeChecked();

  // 元に戻す
  await taskCheckbox.uncheck();
  await expect(taskCheckbox).not.toBeChecked();
});
```

## 受け入れ基準チェックリスト

- [ ] タスク一覧が表示される
- [ ] ステータス・優先度でフィルタリングできる
- [ ] 検索機能が動作する
- [ ] ソート機能が動作する
- [ ] チェックボックスで完了/未完了を切り替えられる
- [ ] 楽観的更新が即座に反映される
- [ ] 仮想スクロールで大量タスクも快適
- [ ] ローディング状態が表示される
- [ ] 空状態が適切に表示される

## 依存関係

- Task 2.2（CRUD API）
- @tanstack/react-virtual
- shadcn/ui コンポーネント

## 実装順序

1. 基本的なTaskListコンポーネント
2. TaskItemコンポーネント
3. バッジコンポーネント
4. フィルター機能
5. 検索機能
6. 仮想スクロール統合
7. 楽観的更新
8. テスト実装

## 関連ドキュメント

- `specs/design-system.md` - UI コンポーネント仕様
- `specs/prd.md` - タスク一覧要件
- [TanStack Virtual Documentation](https://tanstack.com/virtual/latest)
