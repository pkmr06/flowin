import { useTaskTimer } from '@/hooks/useTaskTimer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Check, Minimize2, Maximize2 } from 'lucide-react';
import type { Task } from '@/../../packages/shared/src/types/task';

interface FocusBarProps {
	activeTask: Task;
	onComplete: () => void;
	isFocusMode: boolean;
	onToggleFocus: () => void;
}

export function FocusBar({ activeTask, onComplete, isFocusMode, onToggleFocus }: FocusBarProps) {
	const { elapsedSeconds, start, stop, complete, isRunning } = useTaskTimer(activeTask.id);

	const hours = Math.floor(elapsedSeconds / 3600);
	const minutes = Math.floor((elapsedSeconds % 3600) / 60);
	const seconds = elapsedSeconds % 60;

	const handleComplete = async () => {
		await complete();
		onComplete();
	};

	return (
		<Card className="fixed top-0 left-0 right-0 z-50 p-5 shadow-lg bg-background/98 backdrop-blur-md border-b">
			<div className="container mx-auto flex items-center justify-between gap-6">
				<div className="flex items-center gap-6 flex-1 min-w-0">
					<div className="text-3xl font-mono font-bold tabular-nums tracking-tight">
						{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-base leading-tight truncate">{activeTask.title}</h3>
						<p className="text-sm text-muted-foreground mt-0.5">
							予定: {activeTask.estimatedDurationMinutes}分
						</p>
					</div>
				</div>

				<div className="flex gap-3 flex-shrink-0">
					{!isRunning ? (
						<Button onClick={start} size="lg" className="h-11 font-medium">
							<Play className="h-5 w-5 mr-2" />
							開始
						</Button>
					) : (
						<>
							<Button onClick={stop} variant="outline" size="lg" className="h-11 font-medium">
								<Pause className="h-5 w-5 mr-2" />
								一時停止
							</Button>
							<Button onClick={handleComplete} size="lg" className="h-11 font-medium">
								<Check className="h-5 w-5 mr-2" />
								完了
							</Button>
						</>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={onToggleFocus}
						className="h-11 w-11"
					>
						{isFocusMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
					</Button>
				</div>
			</div>
		</Card>
	);
}
