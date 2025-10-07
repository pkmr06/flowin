import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CompletionTrendChartProps {
	data: Array<{
		date: string;
		total: number;
		completed: number;
		completionRate: number;
	}>;
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
	return (
		<Card className="p-6">
			<h3 className="text-lg font-semibold mb-4">完了率推移</h3>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis 
						dataKey="date" 
						tickFormatter={(value) => {
							const d = new Date(value);
							return (d.getMonth() + 1) + '/' + d.getDate();
						}}
					/>
					<YAxis />
					<Tooltip 
						labelFormatter={(value) => {
							const d = new Date(value as string);
							return d.toLocaleDateString('ja-JP');
						}}
						formatter={(value: number) => [value + '%', '完了率']}
					/>
					<Line 
						type="monotone" 
						dataKey="completionRate" 
						stroke="#3b82f6" 
						strokeWidth={2}
						dot={{ fill: '#3b82f6' }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</Card>
	);
}
