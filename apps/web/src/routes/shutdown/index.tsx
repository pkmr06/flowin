import { createFileRoute } from '@tanstack/react-router';
import { trpc } from '@/utils/trpc';
import { ShutdownRitual } from '@/features/reflection/ShutdownRitual';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function ShutdownPage() {
	// 今日のプランを取得
	const { data: plan, isLoading } = trpc.dailyPlans.getOrCreateToday.useQuery();

	// タスク一覧を取得して完了数をカウント
	const { data: tasks } = trpc.tasks.list.useQuery({
		sortBy: 'createdAt',
		sortOrder: 'desc',
	});

	if (isLoading || !plan) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const completedCount = tasks?.filter(t => t.status === 'completed').length || 0;
	const totalCount = tasks?.length || 0;

	return (
		<div className="min-h-screen bg-background py-8">
			<ShutdownRitual
				dailyPlanId={plan.id}
				completedCount={completedCount}
				totalCount={totalCount}
			/>
		</div>
	);
}

export const Route = createFileRoute('/shutdown/')({
	component: ShutdownPage,
});
