import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

interface Task {
	title: string;
	estimatedMinutes: number;
	priority: 'high' | 'medium' | 'low';
}

interface FirstTaskInputProps {
	tasks: Task[];
	onTasksChange: (tasks: Task[]) => void;
	onComplete: () => void;
	isLoading: boolean;
}

export function FirstTaskInput({ tasks, onTasksChange, onComplete, isLoading }: FirstTaskInputProps) {
	const [currentTask, setCurrentTask] = useState<Partial<Task>>({
		title: '',
		estimatedMinutes: 30,
		priority: 'medium',
	});

	// ローカルストレージに自動保存
	useAutoSave({
		data: tasks,
		onSave: (data) => {
			localStorage.setItem('onboarding-tasks', JSON.stringify(data));
		},
		enabled: tasks.length > 0,
	});

	// 初回ロード時に復元
	useEffect(() => {
		const saved = localStorage.getItem('onboarding-tasks');
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				onTasksChange(parsed);
			} catch (e) {
				console.error('Failed to restore tasks', e);
			}
		}
	}, []);

	const addTask = () => {
		if (currentTask.title && tasks.length < 3) {
			onTasksChange([...tasks, currentTask as Task]);
			setCurrentTask({
				title: '',
				estimatedMinutes: 30,
				priority: 'medium',
			});
		}
	};

	const removeTask = (index: number) => {
		onTasksChange(tasks.filter((_, i) => i !== index));
	};

	return (
		<div className="space-y-8">
			{/* 追加済みタスク一覧 */}
			<div className="space-y-3">
				{tasks.map((task, index) => (
					<div
						key={index}
						className="flex items-center gap-4 p-5 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
							<span className="text-lg">{getPriorityEmoji(task.priority)}</span>
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-medium text-base leading-tight">{task.title}</h3>
							<p className="text-sm text-muted-foreground mt-1">
								{task.estimatedMinutes}分 • {getPriorityLabel(task.priority)}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => removeTask(index)}
							className="flex-shrink-0"
						>
							<X className="h-5 w-5" />
						</Button>
					</div>
				))}
			</div>

			{/* 新規タスク入力 */}
			{tasks.length < 3 && (
				<div className="space-y-5 p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border-2 border-dashed border-border">
					<div className="space-y-3">
						<label htmlFor="task-title" className="block text-sm font-medium">
							タスク {tasks.length + 1}
						</label>
						<Input
							id="task-title"
							value={currentTask.title || ''}
							onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
							placeholder="例: プレゼン資料を完成させる"
							className="h-12 text-base"
							autoFocus={tasks.length === 0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && currentTask.title) {
									e.preventDefault();
									addTask();
								}
							}}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="block text-sm font-medium">予想時間</label>
							<Select
								value={String(currentTask.estimatedMinutes)}
								onValueChange={(val) => setCurrentTask({ ...currentTask, estimatedMinutes: Number(val) })}
							>
								<SelectTrigger className="h-11">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="15">15分</SelectItem>
									<SelectItem value="30">30分</SelectItem>
									<SelectItem value="45">45分</SelectItem>
									<SelectItem value="60">1時間</SelectItem>
									<SelectItem value="90">1時間30分</SelectItem>
									<SelectItem value="120">2時間</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium">優先度</label>
							<Select
								value={currentTask.priority}
								onValueChange={(val) => setCurrentTask({ ...currentTask, priority: val as Task['priority'] })}
							>
								<SelectTrigger className="h-11">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="high">🔴 高</SelectItem>
									<SelectItem value="medium">🟡 中</SelectItem>
									<SelectItem value="low">🟢 低</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Button
						onClick={addTask}
						disabled={!currentTask.title}
						className="w-full h-11"
					>
						<Plus className="h-5 w-5 mr-2" />
						タスクを追加
					</Button>
				</div>
			)}

			{/* 完了ボタン */}
			<Button
				onClick={onComplete}
				disabled={tasks.length === 0 || isLoading}
				size="lg"
				className="w-full h-12 text-base font-medium"
			>
				{isLoading ? '保存中...' : `${tasks.length}個のタスクで始める`}
			</Button>

			{/* ヘルプテキスト */}
			{tasks.length === 0 && (
				<div className="rounded-lg bg-muted/50 p-4">
					<p className="text-sm text-muted-foreground leading-relaxed">
						💡 まずは今日やる3つのタスクを登録しましょう。<br />
						タスクが多すぎると集中力が散漫になるため、最初は3つまでに抑えることをおすすめします。
					</p>
				</div>
			)}
		</div>
	);
}

function getPriorityLabel(priority: 'high' | 'medium' | 'low'): string {
	const labels = {
		high: '優先度: 高',
		medium: '優先度: 中',
		low: '優先度: 低',
	};
	return labels[priority];
}

function getPriorityEmoji(priority: 'high' | 'medium' | 'low'): string {
	const emojis = {
		high: '🔴',
		medium: '🟡',
		low: '🟢',
	};
	return emojis[priority];
}
