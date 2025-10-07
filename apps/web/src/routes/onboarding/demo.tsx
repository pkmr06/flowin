import { createFileRoute } from '@tanstack/react-router';
import { DemoTaskProvider } from '@/features/onboarding/DemoTaskProvider';
import { InteractiveDemo } from '@/features/onboarding/InteractiveDemo';

function OnboardingDemo() {
	return (
		<DemoTaskProvider>
			<div className="min-h-screen bg-background p-8">
				<div className="max-w-6xl mx-auto">
					{/* Welcome message */}
					<div id="welcome-message" className="mb-8">
						<h1 className="text-4xl font-bold mb-2">Flowinへようこそ</h1>
						<p className="text-muted-foreground">
							30秒でFlowinの使い方を体験しましょう
						</p>
					</div>

					{/* Add task button */}
					<button
						id="add-task-button"
						className="mb-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						+ タスクを追加
					</button>

					{/* Task input form */}
					<div className="mb-6 bg-card border border-border rounded-lg p-6">
						<input
							id="task-title-input"
							type="text"
							placeholder="タスク名を入力"
							className="w-full mb-4 px-3 py-2 border border-input rounded-md"
						/>
						
						<select
							id="priority-selector"
							className="mb-4 px-3 py-2 border border-input rounded-md"
						>
							<option value="high">高</option>
							<option value="medium">中</option>
							<option value="low">低</option>
						</select>

						<button
							id="save-task-button"
							className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
						>
							保存
						</button>
					</div>

					{/* Task list */}
					<div id="task-list" className="mb-6 bg-card border border-border rounded-lg p-6">
						<h2 className="text-xl font-semibold mb-4">タスク一覧</h2>
						<div className="space-y-2">
							<div className="flex items-center justify-between p-3 border border-border rounded-md">
								<span>サンプルタスク</span>
								<button
									id="start-task-button"
									className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
								>
									開始
								</button>
							</div>
						</div>
					</div>

					{/* Progress bar */}
					<div id="progress-bar" className="bg-card border border-border rounded-lg p-6">
						<h3 className="text-lg font-semibold mb-2">進捗</h3>
						<div className="w-full bg-secondary rounded-full h-2">
							<div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
						</div>
						<p className="text-sm text-muted-foreground mt-2">3 / 10 タスク完了</p>
					</div>
				</div>

				<InteractiveDemo />
			</div>
		</DemoTaskProvider>
	);
}

export const Route = createFileRoute('/onboarding/demo')({
	component: OnboardingDemo,
});
