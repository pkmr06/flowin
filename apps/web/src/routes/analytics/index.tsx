import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { WeeklySummaryCard } from '@/features/analytics/WeeklySummaryCard';
import { CompletionTrendChart } from '@/features/analytics/CompletionTrendChart';
import { TimeAllocationPie } from '@/features/analytics/TimeAllocationPie';
import { SatisfactionTrendChart } from '@/features/analytics/SatisfactionTrendChart';
import { ExportDialog } from '@/features/analytics/ExportDialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download } from 'lucide-react';

function AnalyticsPage() {
	const [trendDays, setTrendDays] = useState(30);
	
	// 今週の開始日を計算
	const getWeekStart = () => {
		const today = new Date();
		const dayOfWeek = today.getDay();
		const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
		const monday = new Date(today.setDate(diff));
		return monday.toISOString().split('T')[0];
	};

	const weekStartDate = getWeekStart();

	// データ取得
	const { data: weeklySummary, isLoading: summaryLoading } = trpc.analytics.getWeeklySummary.useQuery({
		startDate: weekStartDate,
	});

	const { data: completionTrend, isLoading: trendLoading } = trpc.analytics.getCompletionTrend.useQuery({
		days: trendDays,
	});

	const { data: timeAllocation, isLoading: allocationLoading } = trpc.analytics.getTimeAllocation.useQuery({
		startDate: weekStartDate,
		endDate: new Date().toISOString().split('T')[0],
	});

	const { data: satisfactionTrend, isLoading: satisfactionLoading } = trpc.analytics.getSatisfactionTrend.useQuery({
		days: trendDays,
	});

	if (summaryLoading || trendLoading || allocationLoading || satisfactionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* ヘッダー */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">分析とインサイト</h1>
						<p className="text-muted-foreground mt-1">あなたの生産性を可視化します</p>
					</div>
					<ExportDialog>
						<Button variant="outline" className="gap-2">
							<Download className="h-4 w-4" />
							データをエクスポート
						</Button>
					</ExportDialog>
				</div>

				{/* 週次サマリー */}
				{weeklySummary && (
					<WeeklySummaryCard
						totalTasks={weeklySummary.totalTasks}
						completedTasks={weeklySummary.completedTasks}
						totalMinutes={weeklySummary.totalMinutes}
						completionRate={weeklySummary.completionRate}
					/>
				)}

				{/* 期間選択 */}
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">表示期間:</span>
					<Select value={String(trendDays)} onValueChange={(value) => setTrendDays(Number(value))}>
						<SelectTrigger className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">7日間</SelectItem>
							<SelectItem value="14">14日間</SelectItem>
							<SelectItem value="30">30日間</SelectItem>
							<SelectItem value="60">60日間</SelectItem>
							<SelectItem value="90">90日間</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* グラフ */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{completionTrend && <CompletionTrendChart data={completionTrend} />}
					{timeAllocation && <TimeAllocationPie data={timeAllocation} />}
				</div>

				{satisfactionTrend && <SatisfactionTrendChart data={satisfactionTrend} />}
			</div>
		</div>
	);
}

export const Route = createFileRoute('/analytics/')({
	component: AnalyticsPage,
});
