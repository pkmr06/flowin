import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TimeAllocationPieProps {
	data: Array<{
		priority: string;
		minutes: number;
		percentage: number;
		label: string;
	}>;
}

const COLORS = {
	high: '#ef4444',
	medium: '#f59e0b',
	low: '#10b981',
};

export function TimeAllocationPie({ data }: TimeAllocationPieProps) {
	const chartData = data.map(item => ({
		name: item.label,
		value: item.minutes,
		percentage: item.percentage,
	}));

	return (
		<Card className="p-6">
			<h3 className="text-lg font-semibold mb-4">優先度別時間配分</h3>
			<ResponsiveContainer width="100%" height={300}>
				<PieChart>
					<Pie
						data={chartData}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={({ name, percentage }) => percentage + '%'}
						outerRadius={80}
						fill="#8884d8"
						dataKey="value"
					>
						{data.map((entry, index) => (
							<Cell key={index} fill={COLORS[entry.priority as keyof typeof COLORS]} />
						))}
					</Pie>
					<Tooltip 
						formatter={(value: number) => {
							const hours = Math.floor(value / 60);
							const mins = value % 60;
							return hours + 'h ' + mins + 'm';
						}}
					/>
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</Card>
	);
}
