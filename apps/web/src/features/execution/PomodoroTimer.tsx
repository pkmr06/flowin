import { usePomodoro } from '@/hooks/usePomodoro';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, SkipForward } from 'lucide-react';
import { useEffect } from 'react';

export function PomodoroTimer() {
	const { phase, remainingSeconds, startWork, startBreak, skip, isActive } = usePomodoro(25, 5);

	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;

	// 通知権限リクエスト
	useEffect(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	}, []);

	// フェーズ変更時の通知
	useEffect(() => {
		if (!isActive) return;

		if (phase === 'break' && remainingSeconds === 5 * 60) {
			// 休憩開始
			if (Notification.permission === 'granted') {
				new Notification('休憩時間です！', {
					body: '5分休憩しましょう',
					icon: '/icon.png',
				});
			}
		} else if (phase === 'work' && remainingSeconds === 25 * 60) {
			// 作業開始
			if (Notification.permission === 'granted') {
				new Notification('作業時間です', {
					body: '25分集中して作業しましょう',
					icon: '/icon.png',
				});
			}
		}
	}, [phase, remainingSeconds, isActive]);

	if (!isActive) {
		return (
			<Card className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Coffee className="h-5 w-5 text-muted-foreground" />
						<span className="text-sm font-medium">ポモドーロタイマー</span>
					</div>
					<Button onClick={startWork} variant="outline" size="sm">
						開始 (25分)
					</Button>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{phase === 'work' ? (
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							<span className="text-sm font-medium">作業中</span>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Coffee className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">休憩中</span>
						</div>
					)}
					<div className="text-2xl font-mono font-bold">
						{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
					</div>
				</div>

				<Button onClick={skip} variant="ghost" size="sm">
					<SkipForward className="h-4 w-4 mr-1" />
					スキップ
				</Button>
			</div>
		</Card>
	);
}
