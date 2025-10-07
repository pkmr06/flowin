import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/utils/trpc';

export function useTaskTimer(taskId: string | null) {
	const [elapsedMs, setElapsedMs] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const intervalRef = useRef<number | undefined>(undefined);

	const updateMutation = trpc.tasks.update.useMutation();

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const start = async () => {
		if (!taskId) return;

		// タスクを進行中に更新
		await updateMutation.mutateAsync({
			id: taskId,
			status: 'in_progress',
		});

		const startTime = Date.now();
		setIsRunning(true);

		intervalRef.current = window.setInterval(() => {
			setElapsedMs(Date.now() - startTime);
		}, 1000);
	};

	const stop = async () => {
		if (!taskId) return;

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		setIsRunning(false);
		setElapsedMs(0);
	};

	const complete = async () => {
		if (!taskId) return;

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// タスクを完了に更新
		await updateMutation.mutateAsync({
			id: taskId,
			status: 'completed',
		});

		setIsRunning(false);
		setElapsedMs(0);
	};

	return {
		elapsedMs,
		isRunning,
		start,
		stop,
		complete,
		elapsedSeconds: Math.floor(elapsedMs / 1000),
		elapsedMinutes: Math.floor(elapsedMs / 60000),
	};
}
