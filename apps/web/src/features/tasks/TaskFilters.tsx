import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TaskFiltersProps {
	filters: {
		status?: string;
		priority?: string;
		sortBy: string;
		sortOrder: string;
	};
	onFiltersChange: (filters: any) => void;
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
	return (
		<div className="flex gap-2">
			{/* ステータスフィルター */}
			<Select
				value={filters.status || 'all'}
				onValueChange={(value) =>
					onFiltersChange({ ...filters, status: value === 'all' ? undefined : value })
				}
			>
				<SelectTrigger className="w-[120px]">
					<SelectValue placeholder="ステータス" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">すべて</SelectItem>
					<SelectItem value="pending">未着手</SelectItem>
					<SelectItem value="in_progress">進行中</SelectItem>
					<SelectItem value="completed">完了</SelectItem>
				</SelectContent>
			</Select>

			{/* 優先度フィルター */}
			<Select
				value={filters.priority || 'all'}
				onValueChange={(value) =>
					onFiltersChange({ ...filters, priority: value === 'all' ? undefined : value })
				}
			>
				<SelectTrigger className="w-[120px]">
					<SelectValue placeholder="優先度" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">すべて</SelectItem>
					<SelectItem value="high">高</SelectItem>
					<SelectItem value="medium">中</SelectItem>
					<SelectItem value="low">低</SelectItem>
				</SelectContent>
			</Select>

			{/* ソートフィルター */}
			<Select
				value={filters.sortBy}
				onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
			>
				<SelectTrigger className="w-[140px]">
					<SelectValue placeholder="並び替え" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="createdAt">作成日時</SelectItem>
					<SelectItem value="updatedAt">更新日時</SelectItem>
					<SelectItem value="priority">優先度</SelectItem>
					<SelectItem value="title">タイトル</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
