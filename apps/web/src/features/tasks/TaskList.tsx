import { TaskItem } from './TaskItem';
import type { Task } from '@/../../packages/shared/src/types/task';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TaskListProps {
	tasks: Task[];
	isLoading?: boolean;
}

export function TaskList({ tasks, isLoading }: TaskListProps) {
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
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					タスクを作成
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{tasks.map((task) => (
				<TaskItem key={task.id} task={task} />
			))}
		</div>
	);
}
