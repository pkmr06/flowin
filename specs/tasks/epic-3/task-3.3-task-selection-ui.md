# Task 3.3: タスク選択UI実装

**Epic**: Epic 3 - デイリープランニング
**User Story**: US-3.1, US-3.3
**優先度**: Critical
**推定工数**: 3日

## 概要
タスク一覧から今日のプランに追加するタスクを選択し、ドラッグ＆ドロップで順序調整できるUIを実装する。

## 技術要件

### プランニング画面

#### 1. DailyPlanningView
```tsx
// apps/web/src/routes/planning/index.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { TaskSelector } from '@/features/planning/TaskSelector';
import { SelectedTasksList } from '@/features/planning/SelectedTasksList';
import { PlanSummary } from '@/features/planning/PlanSummary';
import { Button } from '@/components/ui/button';

export function DailyPlanningPage() {
  const { data: plan, isLoading } = trpc.dailyPlans.getOrCreateToday.useQuery();
  const { data: availableTasks } = trpc.tasks.list.useQuery({
    status: 'pending',
  });

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">今日のプランニング</h1>
        <p className="text-muted-foreground">
          やるべきタスクを選んで、実行順序を決めましょう
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* タスク選択エリア */}
        <div className="lg:col-span-2">
          <TaskSelector
            availableTasks={availableTasks || []}
            selectedBlocks={plan?.timeBlocks || []}
          />
        </div>

        {/* プランサマリー */}
        <div>
          <PlanSummary
            plan={plan}
            onFinalize={() => {}}
          />
          <div className="mt-4">
            <SelectedTasksList
              timeBlocks={plan?.timeBlocks || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 2. TaskSelector Component
```tsx
// apps/web/src/features/planning/TaskSelector.tsx
import { Task, TimeBlock } from '@flowin/shared/types';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';
import { PriorityBadge } from '@/features/tasks/PriorityBadge';

interface TaskSelectorProps {
  availableTasks: Task[];
  selectedBlocks: TimeBlock[];
}

export function TaskSelector({ availableTasks, selectedBlocks }: TaskSelectorProps) {
  const utils = trpc.useUtils();
  const addBlockMutation = trpc.dailyPlans.addTimeBlock.useMutation({
    onSuccess: () => {
      utils.dailyPlans.getOrCreateToday.invalidate();
    },
  });

  const selectedTaskIds = new Set(selectedBlocks.map(b => b.taskId));
  const unselectedTasks = availableTasks.filter(t => !selectedTaskIds.has(t.id));

  const handleAddTask = async (task: Task) => {
    const plan = await utils.dailyPlans.getOrCreateToday.fetch();
    if (!plan) return;

    addBlockMutation.mutate({
      dailyPlanId: plan.id,
      taskId: task.id,
      startTime: new Date(),
      plannedDurationMinutes: task.estimatedDurationMinutes,
      sortOrder: selectedBlocks.length,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">利用可能なタスク</h2>
      <div className="space-y-3">
        {unselectedTasks.map((task) => (
          <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={task.priority} />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{task.estimatedDurationMinutes}分</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddTask(task)}
                disabled={addBlockMutation.isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                追加
              </Button>
            </div>
          </Card>
        ))}

        {unselectedTasks.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            すべてのタスクがプランに追加されています
          </p>
        )}
      </div>
    </div>
  );
}
```

#### 3. SelectedTasksList with DnD
```tsx
// apps/web/src/features/planning/SelectedTasksList.tsx
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimeBlock } from '@flowin/shared/types';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X } from 'lucide-react';

interface SelectedTasksListProps {
  timeBlocks: TimeBlock[];
}

export function SelectedTasksList({ timeBlocks }: SelectedTasksListProps) {
  const utils = trpc.useUtils();
  const reorderMutation = trpc.dailyPlans.reorderTimeBlocks.useMutation({
    onSuccess: () => {
      utils.dailyPlans.getOrCreateToday.invalidate();
    },
  });

  const removeBlockMutation = trpc.dailyPlans.removeTimeBlock.useMutation({
    onSuccess: () => {
      utils.dailyPlans.getOrCreateToday.invalidate();
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = timeBlocks.findIndex(b => b.id === active.id);
    const newIndex = timeBlocks.findIndex(b => b.id === over.id);

    const reordered = [...timeBlocks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const plan = await utils.dailyPlans.getOrCreateToday.fetch();
    if (plan) {
      reorderMutation.mutate({
        dailyPlanId: plan.id,
        blockIds: reordered.map(b => b.id),
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">今日のタスク</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={timeBlocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {timeBlocks.map((block, index) => (
              <SortableTimeBlock
                key={block.id}
                block={block}
                index={index}
                onRemove={() => removeBlockMutation.mutate({ id: block.id })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {timeBlocks.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          タスクを選択してプランに追加しましょう
        </p>
      )}
    </div>
  );
}

function SortableTimeBlock({ block, index, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
          <div className="flex-1">
            <p className="font-medium">{block.task?.title}</p>
            <p className="text-sm text-muted-foreground">{block.plannedDurationMinutes}分</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

## 受け入れ基準チェックリスト

- [ ] タスク一覧が表示される
- [ ] タスクを「今日のプラン」に追加できる
- [ ] 追加済みタスクが一覧から消える
- [ ] ドラッグ＆ドロップで順序変更できる
- [ ] タスクを削除できる
- [ ] 合計時間が表示される
- [ ] 楽観的更新が即座に反映される

## 依存関係

- Task 3.2（デイリープランAPI）
- @dnd-kit/core

## 実装順序

1. TaskSelector実装
2. SelectedTasksList実装
3. ドラッグ＆ドロップ統合
4. 楽観的更新
5. テスト実装

## 関連ドキュメント

- `specs/prd.md` - プランニングUI要件
- `specs/design-system.md` - UI仕様
