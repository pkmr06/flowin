import { Card } from '@/components/ui/card';
import { TrendingUp, CheckCircle2, Clock } from 'lucide-react';

interface WeeklySummaryCardProps {
	totalTasks: number;
	completedTasks: number;
	totalMinutes: number;
	completionRate: number;
}

export function WeeklySummaryCard({ totalTasks, completedTasks, totalMinutes, completionRate }: WeeklySummaryCardProps) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<Card className="p-6">
				<div className="flex items-center gap-3">
					<div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
						<CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">完了タスク</p>
						<p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
					</div>
				</div>
			</Card>

			<Card className="p-6">
				<div className="flex items-center gap-3">
					<div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
						<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">完了率</p>
						<p className="text-2xl font-bold">{completionRate}%</p>
					</div>
				</div>
			</Card>

			<Card className="p-6">
				<div className="flex items-center gap-3">
					<div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
						<Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">作業時間</p>
						<p className="text-2xl font-bold">{hours}h {minutes}m</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
