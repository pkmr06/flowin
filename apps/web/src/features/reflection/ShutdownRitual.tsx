import { useState } from 'react';
import { ReflectionForm } from './ReflectionForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface ShutdownRitualProps {
	dailyPlanId: string;
	completedCount: number;
	totalCount: number;
}

export function ShutdownRitual({ dailyPlanId, completedCount, totalCount }: ShutdownRitualProps) {
	const [step, setStep] = useState<'reflection' | 'tomorrow' | 'complete'>('reflection');
	const navigate = useNavigate();

	if (step === 'reflection') {
		return (
			<div className="max-w-2xl mx-auto p-4">
				<ReflectionForm
					dailyPlanId={dailyPlanId}
					completedCount={completedCount}
					totalCount={totalCount}
					onComplete={() => setStep('tomorrow')}
				/>
			</div>
		);
	}

	if (step === 'tomorrow') {
		return (
			<div className="max-w-2xl mx-auto p-4">
				<Card className="p-8 text-center">
					<Calendar className="h-16 w-16 mx-auto mb-4 text-blue-500" />
					<h2 className="text-2xl font-bold mb-2">明日の準備</h2>
					<p className="text-muted-foreground mb-6">
						明日のタスクを確認して、良い一日のスタートを切りましょう
					</p>
					<div className="space-y-3">
						<Button
							onClick={() => navigate({ to: '/tasks' })}
							className="w-full"
							size="lg"
						>
							明日のタスクを確認
						</Button>
						<Button
							onClick={() => setStep('complete')}
							variant="outline"
							className="w-full"
							size="lg"
						>
							スキップ
						</Button>
					</div>
				</Card>
			</div>
		);
	}

	// step === 'complete'
	return (
		<div className="max-w-2xl mx-auto p-4">
			<Card className="p-8 text-center">
				<CheckCircle2 className="h-20 w-20 mx-auto mb-4 text-green-500" />
				<h2 className="text-3xl font-bold mb-2">お疲れさまでした！</h2>
				<p className="text-muted-foreground mb-6">
					今日も一日よく頑張りました。ゆっくり休んで、また明日頑張りましょう。
				</p>
				<div className="space-y-3">
					<Button
						onClick={() => navigate({ to: '/dashboard' })}
						className="w-full"
						size="lg"
					>
						ダッシュボードへ
					</Button>
				</div>
			</Card>
		</div>
	);
}
