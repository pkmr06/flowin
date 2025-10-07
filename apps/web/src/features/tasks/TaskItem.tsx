import type { Task } from '@/../../packages/shared/src/types/task';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Clock } from 'lucide-react';
import { trpc } from '@/utils/trpc';
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

			utils.tasks.list.setData({}, (old) =>
				old?.map((t) => (t.id === newTask.id ? { ...t, ...newTask } : t))
			);

			return { previousTasks };
		},
		onError: (_err, _newTask, context) => {
			utils.tasks.list.setData({}, context?.previousTasks);
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

	const getPriorityColor = (priority: string) => {
		const colors = {
			high: 'text-destructive bg-destructive/10 border-destructive/20',
			medium: 'text-warning bg-warning/10 border-warning/20',
			low: 'text-success bg-success/10 border-success/20',
		};
		return colors[priority as keyof typeof colors] || colors.medium;
	};

	const getStatusLabel = (status: string) => {
		const labels = {
			pending: '未着手',
			in_progress: '進行中',
			completed: '完了',
			cancelled: 'キャンセル',
		};
		return labels[status as keyof typeof labels] || status;
	};

	return (
		<Card
			className={cn(
				'p-5 mb-3 hover:shadow-md transition-all duration-200 border border-border rounded-xl',
				task.status === 'completed' && 'opacity-60 bg-muted/30'
			)}
		>
			<div className="flex items-start gap-4">
				{/* チェックボックス */}
				<Checkbox
					checked={task.status === 'completed'}
					onCheckedChange={handleCheckToggle}
					className="mt-0.5"
				/>

				{/* タスク情報 */}
				<div className="flex-1 min-w-0">
					<h3
						className={cn(
							'font-medium text-base leading-tight mb-2',
							task.status === 'completed' && 'line-through text-muted-foreground'
						)}
					>
						{task.title}
					</h3>

					{task.description && (
						<p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
							{task.description}
						</p>
					)}

					<div className="flex items-center gap-2 flex-wrap">
						{/* 優先度バッジ */}
						<span className={cn('text-xs font-medium px-2.5 py-1 rounded-md border', getPriorityColor(task.priority))}>
							{task.priority === 'high' ? '🔴 高' : task.priority === 'medium' ? '🟡 中' : '🟢 低'}
						</span>

						{/* ステータスバッジ */}
						<span className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted border border-border">
							{getStatusLabel(task.status)}
						</span>

						{/* 所要時間 */}
						<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Clock className="h-3.5 w-3.5" />
							<span>{task.estimatedDurationMinutes}分</span>
						</div>
					</div>
				</div>

				{/* メニューボタン */}
				<Button variant="ghost" size="icon" className="flex-shrink-0">
					<MoreHorizontal className="h-5 w-5" />
				</Button>
			</div>
		</Card>
	);
}
