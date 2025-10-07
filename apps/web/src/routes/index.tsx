import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Plus, CheckCircle2, Clock, Calendar } from "lucide-react";
import { TaskFormModal } from "@/features/tasks/TaskFormModal";
import { TaskItem } from "@/features/tasks/TaskItem";
import type { Task } from "@/../../packages/shared/src/types/task";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

	// 今日のタスク一覧を取得
	const tasksQuery = trpc.tasks.list.useQuery({});
	const tasks: Task[] = tasksQuery.data || [];

	// 今日のタスクのみをフィルタ（実際は日付フィルタを追加する必要がある）
	const todayTasks: Task[] = tasks;

	// 優先度順にソート
	const sortedTasks = [...todayTasks].sort((a: Task, b: Task) => {
		const priorityOrder: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };
		return priorityOrder[a.priority] - priorityOrder[b.priority];
	});

	// 進捗計算
	const completedCount = todayTasks.filter((t: Task) => t.status === 'completed').length;
	const totalCount = todayTasks.length;
	const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	// 予定時間と実績時間の計算
	const totalEstimatedMinutes = todayTasks.reduce((sum: number, t: Task) => sum + t.estimatedDurationMinutes, 0);

	// 現在の時刻から挨拶メッセージを生成
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "おはようございます";
		if (hour < 18) return "こんにちは";
		return "お疲れ様です";
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto max-w-5xl px-4 py-8">
				{/* ヘッダー */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-3">
						<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
							<Sparkles className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">Flowin</h1>
							<p className="text-sm text-muted-foreground">タスクと時間を、フローに変える</p>
						</div>
					</div>
				</div>

				{/* ウェルカムメッセージと日付 */}
				<Card className="p-6 mb-6 border border-border rounded-xl shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-semibold mb-2">{getGreeting()}</h2>
							<div className="flex items-center gap-2 text-muted-foreground">
								<Calendar className="h-4 w-4" />
								<span className="text-sm">
									{new Date().toLocaleDateString('ja-JP', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										weekday: 'long'
									})}
								</span>
							</div>
						</div>
						<Button
							size="lg"
							onClick={() => setIsTaskModalOpen(true)}
							className="h-12 font-medium"
						>
							<Plus className="h-5 w-5 mr-2" />
							タスクを追加
						</Button>
					</div>
				</Card>

				{/* 進捗トラッカー */}
				{totalCount > 0 && (
					<Card className="p-6 mb-6 border border-border rounded-xl shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">今日の進捗</h3>
							<span className="text-2xl font-bold tabular-nums">{completionPercentage}%</span>
						</div>
						<Progress value={completionPercentage} className="h-3 mb-4" />
						<div className="grid grid-cols-3 gap-4 text-center">
							<div className="p-3 bg-muted/50 rounded-lg">
								<div className="flex items-center justify-center gap-2 mb-1">
									<CheckCircle2 className="h-4 w-4 text-success" />
									<span className="text-xs font-medium text-muted-foreground">完了</span>
								</div>
								<span className="text-xl font-bold">{completedCount}</span>
							</div>
							<div className="p-3 bg-muted/50 rounded-lg">
								<div className="flex items-center justify-center gap-2 mb-1">
									<Clock className="h-4 w-4 text-primary" />
									<span className="text-xs font-medium text-muted-foreground">残り</span>
								</div>
								<span className="text-xl font-bold">{totalCount - completedCount}</span>
							</div>
							<div className="p-3 bg-muted/50 rounded-lg">
								<div className="flex items-center justify-center gap-2 mb-1">
									<Clock className="h-4 w-4 text-muted-foreground" />
									<span className="text-xs font-medium text-muted-foreground">予定時間</span>
								</div>
								<span className="text-xl font-bold">{totalEstimatedMinutes}<span className="text-sm font-normal text-muted-foreground">分</span></span>
							</div>
						</div>
					</Card>
				)}

				{/* タスクリストまたは空の状態 */}
				<div>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-xl font-semibold">今日のタスク</h3>
						{totalCount > 0 && (
							<span className="text-sm text-muted-foreground">
								{totalCount}件のタスク
							</span>
						)}
					</div>

					{totalCount === 0 ? (
						<Card className="p-12 border-2 border-dashed border-border rounded-xl text-center">
							<div className="max-w-md mx-auto space-y-4">
								<div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
									<Plus className="h-8 w-8 text-muted-foreground" />
								</div>
								<div>
									<h4 className="text-lg font-semibold mb-2">今日やることを整理しましょう</h4>
									<p className="text-sm text-muted-foreground leading-relaxed mb-4">
										まずは今日達成したい3〜5個のタスクを追加してみましょう。<br />
										シンプルに始めることで、集中力を維持できます。
									</p>
								</div>
								<Button
									size="lg"
									onClick={() => setIsTaskModalOpen(true)}
									className="h-12 font-medium"
								>
									<Plus className="h-5 w-5 mr-2" />
									最初のタスクを追加
								</Button>
							</div>
						</Card>
					) : (
						<div className="space-y-3">
							{sortedTasks.map((task) => (
								<TaskItem key={task.id} task={task} />
							))}
						</div>
					)}
				</div>
			</div>

			{/* タスク作成モーダル */}
			<TaskFormModal
				mode="create"
				isOpen={isTaskModalOpen}
				onClose={() => setIsTaskModalOpen(false)}
			/>
		</div>
	);
}
