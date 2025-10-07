import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { FocusMode } from '@/features/execution/FocusMode';
import { PomodoroTimer } from '@/features/execution/PomodoroTimer';
import { ProgressTracker } from '@/features/execution/ProgressTracker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

function FocusPage() {
	const navigate = useNavigate();
	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

	// 進行中のタスクを取得
	const { data: tasks } = trpc.tasks.list.useQuery({
		status: 'in_progress',
		sortBy: 'updatedAt',
		sortOrder: 'desc',
	});

	const activeTask = tasks?.[0];

	useEffect(() => {
		if (activeTask) {
			setActiveTaskId(activeTask.id);
		}
	}, [activeTask]);

	const handleComplete = () => {
		setActiveTaskId(null);
		// タスク一覧に戻る
		navigate({ to: '/tasks' });
	};

	if (!activeTask) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<Card className="max-w-md w-full p-8 text-center">
					<h2 className="text-2xl font-bold mb-4">実行中のタスクがありません</h2>
					<p className="text-muted-foreground mb-6">
						タスクを選択して開始してください
					</p>
					<Button onClick={() => navigate({ to: '/tasks' })}>
						タスク一覧へ
					</Button>
				</Card>
			</div>
		);
	}

	return (
		<div>
			<FocusMode
				activeTask={activeTask}
				onComplete={handleComplete}
				onExit={() => navigate({ to: '/tasks' })}
			/>

			{/* サイドバー: ポモドーロと進捗 */}
			<div className="fixed right-4 top-24 w-80 space-y-4">
				<PomodoroTimer />
				<ProgressTracker
					progress={{
						total: 10,
						completed: 3,
						inProgress: 1,
						pending: 6,
					}}
					totalMinutes={360}
					elapsedMinutes={120}
				/>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/focus/')({
	component: FocusPage,
});
