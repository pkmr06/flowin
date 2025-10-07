import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { TaskList } from '@/features/tasks/TaskList';
import { TaskFilters } from '@/features/tasks/TaskFilters';
import { TaskCreateButton } from '@/features/tasks/TaskCreateButton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function TasksPage() {
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
			{/* ヘッダー */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold mb-2">タスク</h1>
					<p className="text-muted-foreground">
						{tasks ? `${tasks.length}個のタスク` : 'ロード中...'}
					</p>
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

export const Route = createFileRoute('/tasks/')({
	component: TasksPage,
});
