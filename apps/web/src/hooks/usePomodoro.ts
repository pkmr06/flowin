import { useState, useEffect } from 'react';

export function usePomodoro(workMinutes = 25, breakMinutes = 5) {
	const [phase, setPhase] = useState<'work' | 'break' | 'idle'>('idle');
	const [remainingSeconds, setRemainingSeconds] = useState(0);

	const startWork = () => {
		setPhase('work');
		setRemainingSeconds(workMinutes * 60);
	};

	const startBreak = () => {
		setPhase('break');
		setRemainingSeconds(breakMinutes * 60);
	};

	useEffect(() => {
		if (phase === 'idle' || remainingSeconds <= 0) return;

		const interval = setInterval(() => {
			setRemainingSeconds((s) => {
				if (s <= 1) {
					if (phase === 'work') {
						// 休憩時間開始
						startBreak();
					} else {
						// 休憩終了
						setPhase('idle');
					}
					return 0;
				}
				return s - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [phase, remainingSeconds]);

	return {
		phase,
		remainingSeconds,
		startWork,
		startBreak,
		skip: () => setPhase('idle'),
		isActive: phase !== 'idle',
	};
}
