import { useState, useEffect } from 'react';
import { FocusBar } from './FocusBar';
import type { Task } from '@/../../packages/shared/src/types/task';
import { Card } from '@/components/ui/card';

interface FocusModeProps {
	activeTask: Task;
	onComplete: () => void;
	onExit: () => void;
}

export function FocusMode({ activeTask, onComplete, onExit }: FocusModeProps) {
	const [isFocusMode, setIsFocusMode] = useState(false);

	// ESCキーでフォーカスモード解除
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isFocusMode) {
				setIsFocusMode(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isFocusMode]);

	return (
		<div className="min-h-screen bg-background">
			<FocusBar
				activeTask={activeTask}
				onComplete={onComplete}
				isFocusMode={isFocusMode}
				onToggleFocus={() => setIsFocusMode(!isFocusMode)}
			/>

			<div className="pt-28 container mx-auto px-4 pb-12">
				{isFocusMode ? (
					// フォーカスモード: タスク詳細のみ表示
					<div className="max-w-2xl mx-auto">
						<Card className="p-8 border border-border rounded-xl shadow-sm">
							<h2 className="text-3xl font-bold mb-6 leading-tight">{activeTask.title}</h2>
							{activeTask.description && (
								<p className="text-base text-muted-foreground mb-8 leading-relaxed">
									{activeTask.description}
								</p>
							)}
							<div className="space-y-4">
								<div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
									<span className="text-sm font-medium text-muted-foreground">優先度</span>
									<span className="text-sm font-semibold">
										{activeTask.priority === 'high' ? '🔴 高' : activeTask.priority === 'medium' ? '🟡 中' : '🟢 低'}
									</span>
								</div>
								<div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
									<span className="text-sm font-medium text-muted-foreground">予定時間</span>
									<span className="text-sm font-semibold">{activeTask.estimatedDurationMinutes}分</span>
								</div>
							</div>
						</Card>

						<div className="mt-8 text-center">
							<div className="rounded-lg bg-muted/50 p-4 inline-block">
								<p className="text-sm text-muted-foreground leading-relaxed">
									💡 集中して作業しましょう<br />
									ESCキーで通常モードに戻ります
								</p>
							</div>
						</div>
					</div>
				) : (
					// 通常モード: タスク一覧も表示可能
					<div className="max-w-3xl mx-auto">
						<Card className="p-8 mb-8 border border-border rounded-xl shadow-sm">
							<h2 className="text-2xl font-bold mb-4">実行中のタスク</h2>
							<h3 className="text-xl font-semibold mb-3">{activeTask.title}</h3>
							{activeTask.description && (
								<p className="text-base text-muted-foreground leading-relaxed">
									{activeTask.description}
								</p>
							)}
						</Card>

						<div className="text-center">
							<div className="rounded-lg bg-muted/50 p-6 inline-block">
								<p className="text-sm text-muted-foreground leading-relaxed">
									フォーカスモードでより集中した作業環境を利用できます
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
