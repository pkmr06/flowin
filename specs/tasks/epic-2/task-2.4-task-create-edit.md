# Task 2.4: タスク作成・編集UI実装

**Epic**: Epic 2 - タスク管理基盤
**User Story**: US-2.1, US-2.3
**優先度**: Critical
**推定工数**: 2日

## 概要
タスク作成・編集モーダルを実装し、フォームバリデーション、自動保存、キーボードショートカットを提供する。

## 技術要件

### タスク作成モーダル

#### 1. TaskCreateButton
```tsx
// apps/web/src/features/tasks/TaskCreateButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskFormModal } from './TaskFormModal';
import { useHotkeys } from 'react-hotkeys-hook';

interface TaskCreateButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
}

export function TaskCreateButton({ variant = 'default' }: TaskCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // キーボードショートカット: Cmd+K (Mac) / Ctrl+K (Win)
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setIsOpen(true);
  });

  return (
    <>
      <Button
        variant={variant}
        size="default"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        新規タスク
      </Button>

      <TaskFormModal
        mode="create"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

#### 2. TaskFormModal
```tsx
// apps/web/src/features/tasks/TaskFormModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';
import { Task } from '@flowin/shared/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string()
    .max(2000, '説明は2000文字以内で入力してください')
    .optional(),
  estimatedDurationMinutes: z.coerce.number()
    .int('整数で入力してください')
    .min(15, '最小15分から設定できます')
    .max(480, '最大8時間まで設定できます'),
  priority: z.enum(['high', 'medium', 'low']),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskFormModal({ mode, task, isOpen, onClose }: TaskFormModalProps) {
  const utils = trpc.useUtils();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      estimatedDurationMinutes: task?.estimatedDurationMinutes || 30,
      priority: task?.priority || 'medium',
    },
  });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getSummary.invalidate();
      form.reset();
      onClose();
    },
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getById.invalidate({ id: task!.id });
      onClose();
    },
  });

  const onSubmit = (data: FormValues) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else if (task) {
      updateMutation.mutate({
        id: task.id,
        ...data,
      });
    }
  };

  // モーダルが開いたらタイトル入力にフォーカス
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const input = document.querySelector('input[name="title"]') as HTMLInputElement;
        input?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 自動保存（下書き）
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (mode === 'create' && value.title) {
        localStorage.setItem('task-draft', JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, mode]);

  // 下書き復元
  useEffect(() => {
    if (mode === 'create' && isOpen) {
      const draft = localStorage.getItem('task-draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          form.reset(parsed);
        } catch (e) {
          console.error('Failed to restore draft', e);
        }
      }
    }
  }, [mode, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '新規タスク作成' : 'タスク編集'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例: プレゼン資料を完成させる"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 説明 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="タスクの詳細や背景を記録"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* 予想時間 */}
              <FormField
                control={form.control}
                name="estimatedDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>予想時間 *</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15分</SelectItem>
                        <SelectItem value="30">30分</SelectItem>
                        <SelectItem value="45">45分</SelectItem>
                        <SelectItem value="60">1時間</SelectItem>
                        <SelectItem value="90">1時間30分</SelectItem>
                        <SelectItem value="120">2時間</SelectItem>
                        <SelectItem value="180">3時間</SelectItem>
                        <SelectItem value="240">4時間</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 優先度 */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>優先度 *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">🔴 高</SelectItem>
                        <SelectItem value="medium">🟡 中</SelectItem>
                        <SelectItem value="low">🟢 低</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {mode === 'create' ? '作成' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### タスク編集

#### 3. TaskItemアクションメニュー
```tsx
// apps/web/src/features/tasks/TaskItemActions.tsx
import { useState } from 'react';
import { Task } from '@flowin/shared/types';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import { TaskFormModal } from './TaskFormModal';

interface TaskItemActionsProps {
  task: Task;
}

export function TaskItemActions({ task }: TaskItemActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const utils = trpc.useUtils();

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getSummary.invalidate();
      setIsDeleteOpen(false);
    },
  });

  const duplicateMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
    },
  });

  const handleDuplicate = () => {
    duplicateMutation.mutate({
      title: `${task.title}（コピー）`,
      description: task.description,
      estimatedDurationMinutes: task.estimatedDurationMinutes,
      priority: task.priority,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            編集
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            複製
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 編集モーダル */}
      <TaskFormModal
        mode="edit"
        task={task}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タスクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{task.title}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate({ id: task.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### キーボードショートカット

#### 4. ショートカットガイド
```tsx
// apps/web/src/components/KeyboardShortcuts.tsx
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useHotkeys('mod+/', () => setIsOpen(true));

  const shortcuts = [
    { key: '⌘K', description: '新規タスク作成' },
    { key: '⌘/', description: 'ショートカット一覧' },
    { key: '/', description: '検索' },
    { key: 'Esc', description: 'モーダルを閉じる' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>キーボードショートカット</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex justify-between items-center">
              <span>{shortcut.description}</span>
              <Badge variant="secondary">{shortcut.key}</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## テスト要件

### コンポーネントテスト
```typescript
// apps/web/src/features/tasks/TaskFormModal.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFormModal } from './TaskFormModal';

describe('TaskFormModal', () => {
  it('should create task on submit', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <TaskFormModal mode="create" isOpen onClose={onClose} />
    );

    await user.type(screen.getByLabelText(/タイトル/), 'プレゼン資料作成');
    await user.selectOptions(screen.getByLabelText(/予想時間/), '60');
    await user.selectOptions(screen.getByLabelText(/優先度/), 'high');

    await user.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(
      <TaskFormModal mode="create" isOpen onClose={() => {}} />
    );

    await user.click(screen.getByText('作成'));

    expect(await screen.findByText('タイトルは必須です')).toBeInTheDocument();
  });

  it('should restore draft on open', () => {
    localStorage.setItem('task-draft', JSON.stringify({
      title: '下書きタスク',
      estimatedDurationMinutes: 45,
    }));

    render(
      <TaskFormModal mode="create" isOpen onClose={() => {}} />
    );

    expect(screen.getByDisplayValue('下書きタスク')).toBeInTheDocument();
  });
});
```

### E2Eテスト
```typescript
// apps/web/tests/e2e/task-create.spec.ts
test('create task via keyboard shortcut', async ({ page }) => {
  await page.goto('/tasks');

  // Cmd+K でモーダル開く
  await page.keyboard.press('Meta+K');

  await expect(page.locator('text=新規タスク作成')).toBeVisible();

  // フォーム入力
  await page.fill('input[name="title"]', 'プレゼン資料作成');
  await page.selectOption('select[name="estimatedDurationMinutes"]', '60');
  await page.selectOption('select[name="priority"]', 'high');

  // 作成
  await page.click('button:has-text("作成")');

  // タスク一覧に追加確認
  await expect(page.locator('text=プレゼン資料作成')).toBeVisible();
});

test('edit task', async ({ page }) => {
  await page.goto('/tasks');

  // アクションメニュー
  await page.click('[data-task-id="1"] button[aria-label="More"]');
  await page.click('text=編集');

  // タイトル変更
  await page.fill('input[name="title"]', '更新されたタイトル');
  await page.click('button:has-text("保存")');

  // 変更確認
  await expect(page.locator('text=更新されたタイトル')).toBeVisible();
});

test('delete task with confirmation', async ({ page }) => {
  await page.goto('/tasks');

  await page.click('[data-task-id="1"] button[aria-label="More"]');
  await page.click('text=削除');

  // 確認ダイアログ
  await expect(page.locator('text=タスクを削除しますか？')).toBeVisible();
  await page.click('button:has-text("削除")');

  // タスクが削除される
  await expect(page.locator('[data-task-id="1"]')).not.toBeVisible();
});
```

## 受け入れ基準チェックリスト

- [ ] タスク作成モーダルが正しく表示される
- [ ] フォームバリデーションが動作する
- [ ] タスク作成が成功する
- [ ] タスク編集が正しく動作する
- [ ] タスク削除に確認ダイアログが表示される
- [ ] Cmd+K でタスク作成モーダルが開く
- [ ] 自動保存（下書き）が動作する
- [ ] 下書きが復元される
- [ ] 複製機能が動作する

## 依存関係

- Task 2.2（CRUD API）
- react-hook-form
- @hookform/resolvers/zod
- react-hotkeys-hook

## 実装順序

1. TaskFormModal基本実装
2. バリデーション
3. 作成・編集ロジック
4. 自動保存機能
5. キーボードショートカット
6. アクションメニュー
7. 削除確認ダイアログ
8. テスト実装

## 関連ドキュメント

- `specs/prd.md` - タスク作成・編集要件
- `specs/design-system.md` - フォームUI仕様
- [React Hook Form Documentation](https://react-hook-form.com)
