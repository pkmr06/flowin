import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TaskProgress {
	total: number;
	completed: number;
	inProgress: number;
	pending: number;
}

interface ProgressTrackerProps {
	progress: TaskProgress;
	totalMinutes: number;
	elapsedMinutes: number;
}

export function ProgressTracker({ progress, totalMinutes, elapsedMinutes }: ProgressTrackerProps) {
	const completionPercentage = progress.total > 0 
		? Math.round((progress.completed / progress.total) * 100)
		: 0;

	const timePercentage = totalMinutes > 0
		? Math.round((elapsedMinutes / totalMinutes) * 100)
		: 0;

	return (
		<div className="space-y-4">
			{/* タスク完了率 */}
			<Card className="p-5 border border-border rounded-xl shadow-sm">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-base font-semibold">タスク進捗</h3>
					<span className="text-2xl font-bold tabular-nums">{completionPercentage}%</span>
				</div>
				<Progress value={completionPercentage} className="h-2.5 mb-4" />
				<div className="grid grid-cols-3 gap-3 text-center">
					<div className="flex flex-col items-center p-3 bg-success/10 rounded-lg">
						<CheckCircle2 className="h-5 w-5 text-success mb-2" />
						<span className="text-xs font-medium text-muted-foreground mb-1">完了</span>
						<span className="text-lg font-bold">{progress.completed}</span>
					</div>
					<div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
						<Clock className="h-5 w-5 text-primary mb-2" />
						<span className="text-xs font-medium text-muted-foreground mb-1">進行中</span>
						<span className="text-lg font-bold">{progress.inProgress}</span>
					</div>
					<div className="flex flex-col items-center p-3 bg-muted rounded-lg">
						<Circle className="h-5 w-5 text-muted-foreground mb-2" />
						<span className="text-xs font-medium text-muted-foreground mb-1">未着手</span>
						<span className="text-lg font-bold">{progress.pending}</span>
					</div>
				</div>
			</Card>

			{/* 時間進捗 */}
			<Card className="p-5 border border-border rounded-xl shadow-sm">
				<div className="flex items-center justify-between mb-3">
					<h3 className="text-base font-semibold">時間進捗</h3>
					<span className="text-2xl font-bold tabular-nums">{timePercentage}%</span>
				</div>
				<Progress value={timePercentage} className="h-2.5 mb-3" />
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">
						<span className="font-semibold text-foreground">{elapsedMinutes}分</span> 経過
					</span>
					<span className="text-muted-foreground">
						合計 <span className="font-semibold text-foreground">{totalMinutes}分</span>
					</span>
				</div>
			</Card>
		</div>
	);
}
