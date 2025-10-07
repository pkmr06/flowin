# Task 2.5: 優先度ドラッグ＆ドロップ実装

**Epic**: Epic 2 - タスク管理基盤
**User Story**: US-2.4
**優先度**: High
**推定工数**: 2日

## 概要
dnd-kitを使用したドラッグ＆ドロップによる優先度変更機能を実装する。直感的な操作でタスクの優先順位を調整できる。

## 技術要件

### ドラッグ＆ドロップセットアップ

#### 1. DnD Context Setup
```tsx
// apps/web/src/features/tasks/TaskListDnD.tsx
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@flowin/shared/types';
import { trpc } from '@/lib/trpc';
import { SortableTaskItem } from './SortableTaskItem';
import { useState, useEffect } from 'react';

interface TaskListDnDProps {
  tasks: Task[];
}

export function TaskListDnD({ tasks }: TaskListDnDProps) {
  const [sortedTasks, setSortedTasks] = useState(tasks);
  const utils = trpc.useUtils();

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
    },
  });

  useEffect(() => {
    setSortedTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8pxドラッグで開始（誤操作防止）
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
    const newIndex = sortedTasks.findIndex((t) => t.id === over.id);

    // 楽観的更新
    const newTasks = [...sortedTasks];
    const [movedTask] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, movedTask);
    setSortedTasks(newTasks);

    // 新しい優先度を計算（位置に基づく）
    const newPriority = calculatePriorityFromPosition(newIndex, newTasks.length);

    // サーバーに反映
    updateMutation.mutate({
      id: active.id as string,
      priority: newPriority,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedTasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <SortableTaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/**
 * 位置から優先度を計算
 * 上位1/3: high, 中位1/3: medium, 下位1/3: low
 */
function calculatePriorityFromPosition(
  position: number,
  total: number
): 'high' | 'medium' | 'low' {
  const ratio = position / total;
  if (ratio < 0.33) return 'high';
  if (ratio < 0.67) return 'medium';
  return 'low';
}
```

#### 2. Sortable Task Item
```tsx
// apps/web/src/features/tasks/SortableTaskItem.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@flowin/shared/types';
import { TaskItem } from './TaskItem';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableTaskItemProps {
  task: Task;
}

export function SortableTaskItem({ task }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'z-50 opacity-50'
      )}
    >
      {/* ドラッグハンドル */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground" />
      </div>

      {/* タスクアイテム（左padding追加） */}
      <div className="pl-8">
        <TaskItem task={task} />
      </div>
    </div>
  );
}
```

### 優先度グループビュー

#### 3. 優先度別グループ表示
```tsx
// apps/web/src/features/tasks/TaskListGrouped.tsx
import { Task } from '@flowin/shared/types';
import { TaskListDnD } from './TaskListDnD';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskListGroupedProps {
  tasks: Task[];
}

export function TaskListGrouped({ tasks }: TaskListGroupedProps) {
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium' && t.status !== 'completed');
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low' && t.status !== 'completed');

  const groups = [
    {
      priority: 'high' as const,
      label: '優先度: 高',
      tasks: highPriorityTasks,
      className: 'border-l-4 border-l-red-500',
    },
    {
      priority: 'medium' as const,
      label: '優先度: 中',
      tasks: mediumPriorityTasks,
      className: 'border-l-4 border-l-yellow-500',
    },
    {
      priority: 'low' as const,
      label: '優先度: 低',
      tasks: lowPriorityTasks,
      className: 'border-l-4 border-l-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.priority}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold">{group.label}</h3>
            <Badge variant="secondary">{group.tasks.length}</Badge>
          </div>

          {group.tasks.length > 0 ? (
            <div className={cn('rounded-lg p-4 bg-card', group.className)}>
              <TaskListDnD tasks={group.tasks} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground pl-4">タスクがありません</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### ドラッグオーバーレイ

#### 4. カスタムドラッグオーバーレイ
```tsx
// apps/web/src/features/tasks/TaskDragOverlay.tsx
import { DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { Task } from '@flowin/shared/types';
import { TaskItem } from './TaskItem';

interface TaskDragOverlayProps {
  activeTask: Task | null;
}

export function TaskDragOverlay({ activeTask }: TaskDragOverlayProps) {
  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>
      {activeTask ? (
        <div className="cursor-grabbing opacity-90 shadow-lg">
          <TaskItem task={activeTask} />
        </div>
      ) : null}
    </DragOverlay>
  );
}
```

### ビュー切り替え

#### 5. リスト/グループビュー切り替え
```tsx
// apps/web/src/features/tasks/TaskViewToggle.tsx
import { Button } from '@/components/ui/button';
import { List, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskViewToggleProps {
  view: 'list' | 'grouped';
  onViewChange: (view: 'list' | 'grouped') => void;
}

export function TaskViewToggle({ view, onViewChange }: TaskViewToggleProps) {
  return (
    <div className="flex gap-1 border rounded-md p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'gap-2',
          view === 'list' && 'bg-accent'
        )}
      >
        <List className="h-4 w-4" />
        リスト
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewChange('grouped')}
        className={cn(
          'gap-2',
          view === 'grouped' && 'bg-accent'
        )}
      >
        <Layers className="h-4 w-4" />
        グループ
      </Button>
    </div>
  );
}
```

#### 6. タスクページ統合
```tsx
// apps/web/src/routes/tasks/index.tsx (更新)
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TaskList } from '@/features/tasks/TaskList';
import { TaskListGrouped } from '@/features/tasks/TaskListGrouped';
import { TaskViewToggle } from '@/features/tasks/TaskViewToggle';
import { TaskFilters } from '@/features/tasks/TaskFilters';
import { TaskCreateButton } from '@/features/tasks/TaskCreateButton';

export function TasksPage() {
  const [view, setView] = useState<'list' | 'grouped'>('list');
  const [filters, setFilters] = useState({
    status: undefined,
    priority: undefined,
    search: '',
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  });

  const { data: tasks, isLoading } = trpc.tasks.list.useQuery(filters);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">タスク</h1>
        <div className="flex gap-2">
          <TaskViewToggle view={view} onViewChange={setView} />
          <TaskCreateButton />
        </div>
      </div>

      <div className="mb-6">
        <TaskFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {view === 'list' ? (
        <TaskList tasks={tasks || []} isLoading={isLoading} />
      ) : (
        <TaskListGrouped tasks={tasks || []} />
      )}
    </div>
  );
}
```

## テスト要件

### コンポーネントテスト
```typescript
// apps/web/src/features/tasks/TaskListDnD.test.tsx
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TaskListDnD } from './TaskListDnD';
import { Task } from '@flowin/shared/types';

const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: '高優先度タスク',
    priority: 'high',
    status: 'pending',
    estimatedDurationMinutes: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    title: '中優先度タスク',
    priority: 'medium',
    status: 'pending',
    estimatedDurationMinutes: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('TaskListDnD', () => {
  it('should render draggable tasks', () => {
    render(<TaskListDnD tasks={mockTasks} />);

    expect(screen.getByText('高優先度タスク')).toBeInTheDocument();
    expect(screen.getByText('中優先度タスク')).toBeInTheDocument();
  });

  it('should show drag handles', () => {
    render(<TaskListDnD tasks={mockTasks} />);

    const handles = screen.getAllByRole('button', { name: /drag/i });
    expect(handles).toHaveLength(2);
  });
});
```

### E2Eテスト
```typescript
// apps/web/tests/e2e/task-dnd.spec.ts
test('drag and drop to change priority', async ({ page }) => {
  await page.goto('/tasks');

  // グループビューに切り替え
  await page.click('button:has-text("グループ")');

  // 優先度セクション確認
  await expect(page.locator('text=優先度: 高')).toBeVisible();
  await expect(page.locator('text=優先度: 中')).toBeVisible();

  // ドラッグ＆ドロップ（高→中へ移動）
  const task = page.locator('[data-task-id="1"]');
  const targetSection = page.locator('[data-priority="medium"]');

  await task.dragTo(targetSection);

  // 優先度が変更される
  await expect(
    page.locator('[data-task-id="1"] [data-priority="medium"]')
  ).toBeVisible();
});

test('view toggle between list and grouped', async ({ page }) => {
  await page.goto('/tasks');

  // 初期表示（リストビュー）
  await expect(page.locator('[data-view="list"]')).toBeVisible();

  // グループビューに切り替え
  await page.click('button:has-text("グループ")');
  await expect(page.locator('text=優先度: 高')).toBeVisible();

  // リストビューに戻す
  await page.click('button:has-text("リスト")');
  await expect(page.locator('[data-view="list"]')).toBeVisible();
});
```

## 受け入れ基準チェックリスト

- [ ] ドラッグハンドルが表示される
- [ ] タスクをドラッグ＆ドロップできる
- [ ] ドロップ位置に基づいて優先度が変更される
- [ ] 優先度別グループ表示が動作する
- [ ] リスト/グループビューを切り替えられる
- [ ] ドラッグ中の視覚的フィードバックがある
- [ ] 楽観的更新が即座に反映される
- [ ] 誤操作防止（8px移動で開始）が機能する

## 依存関係

- Task 2.2（CRUD API）
- Task 2.3（タスク一覧UI）
- @dnd-kit/core
- @dnd-kit/sortable

## 実装順序

1. dnd-kit基本セットアップ
2. SortableTaskItem実装
3. ドラッグ＆ドロップロジック
4. 優先度グループビュー
5. ビュー切り替え機能
6. ドラッグオーバーレイ
7. 楽観的更新
8. テスト実装

## 関連ドキュメント

- `specs/prd.md` - 優先度管理要件
- `specs/design-system.md` - インタラクション設計
- [dnd-kit Documentation](https://docs.dndkit.com)
