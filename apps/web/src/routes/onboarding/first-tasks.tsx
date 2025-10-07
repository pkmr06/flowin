import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FirstTaskInput } from '@/features/onboarding/FirstTaskInput';
import { trpc } from '@/utils/trpc';

function FirstTasksPage() {
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<Array<{
		title: string;
		estimatedMinutes: number;
		priority: 'high' | 'medium' | 'low';
	}>>([]);

	const createTasksMutation = trpc.tasks.batchCreate.useMutation({
		onSuccess: () => {
			// ローカルストレージをクリア
			localStorage.removeItem('onboarding-tasks');
			navigate({ to: '/dashboard' });
		},
	});

	const handleComplete = () => {
		if (tasks.length >= 1) {
			createTasksMutation.mutate({ tasks });
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="max-w-2xl w-full">
				<header className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">今日やることを3つ教えてください</h1>
					<p className="text-muted-foreground">
						まずは小さく始めましょう。3つのタスクから価値を実感できます
					</p>
				</header>

				<FirstTaskInput
					tasks={tasks}
					onTasksChange={setTasks}
					onComplete={handleComplete}
					isLoading={createTasksMutation.isPending}
				/>

				<div className="mt-6 text-center text-sm text-muted-foreground">
					<p>💡 ヒント: 2時間以内に完了できるタスクから始めるのがおすすめです</p>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/onboarding/first-tasks')({
	component: FirstTasksPage,
});
