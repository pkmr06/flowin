import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { demoSteps } from './demo-steps';
import { trpc } from '@/utils/trpc';

export function InteractiveDemo() {
	const completeDemo = trpc.onboarding.completeDemo.useMutation();

	useEffect(() => {
		const driverObj = driver({
			showProgress: true,
			steps: demoSteps,
			onDestroyStarted: () => {
				completeDemo.mutate();
				driverObj.destroy();
			},
			nextBtnText: '次へ',
			prevBtnText: '戻る',
			doneBtnText: '完了',
			progressText: '{{current}}/{{total}}',
			showButtons: ['next', 'previous'],
		});

		driverObj.drive();

		return () => {
			driverObj.destroy();
		};
	}, []);

	return null;
}
