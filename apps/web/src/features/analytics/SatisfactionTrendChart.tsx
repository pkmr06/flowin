import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SatisfactionTrendChartProps {
	data: Array<{
		date: string;
		satisfaction: number;
		energy: number;
	}>;
}

export function SatisfactionTrendChart({ data }: SatisfactionTrendChartProps) {
	return (
		<Card className="p-6">
			<h3 className="text-lg font-semibold mb-4">満足度・エネルギー推移</h3>
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
					<YAxis domain={[0, 5]} />
					<Tooltip 
						labelFormatter={(value) => {
							const d = new Date(value as string);
							return d.toLocaleDateString('ja-JP');
						}}
					/>
					<Legend />
					<Line 
						type="monotone" 
						dataKey="satisfaction" 
						stroke="#8b5cf6" 
						strokeWidth={2}
						dot={{ fill: '#8b5cf6' }}
						name="満足度"
					/>
					<Line 
						type="monotone" 
						dataKey="energy" 
						stroke="#06b6d4" 
						strokeWidth={2}
						dot={{ fill: '#06b6d4' }}
						name="エネルギー"
					/>
				</LineChart>
			</ResponsiveContainer>
		</Card>
	);
}
