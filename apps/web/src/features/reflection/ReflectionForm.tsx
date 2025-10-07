import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/utils/trpc';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
	satisfactionRating: z.number().int().min(1).max(5),
	energyLevel: z.number().int().min(1).max(5).optional(),
	achievements: z.string().max(1000).optional(),
	challenges: z.string().max(1000).optional(),
	learnings: z.string().max(1000).optional(),
	tomorrowPriorities: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReflectionFormProps {
	dailyPlanId: string;
	completedCount: number;
	totalCount: number;
	onComplete: () => void;
}

export function ReflectionForm({
	dailyPlanId,
	completedCount,
	totalCount,
	onComplete,
}: ReflectionFormProps) {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			satisfactionRating: 3,
			energyLevel: 3,
			achievements: '',
			challenges: '',
			learnings: '',
			tomorrowPriorities: '',
		},
	});

	const createMutation = trpc.reflections.create.useMutation({
		onSuccess: () => {
			onComplete();
		},
	});

	const onSubmit = (data: FormValues) => {
		createMutation.mutate({
			dailyPlanId,
			completedTasksCount: completedCount,
			totalTasksCount: totalCount,
			...data,
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<Card className="p-6">
					<h2 className="text-2xl font-bold mb-4">今日の振り返り</h2>
					<p className="text-muted-foreground mb-6">
						今日は {totalCount} 個中 {completedCount} 個のタスクを完了しました
					</p>

					{/* 満足度 */}
					<FormField
						control={form.control}
						name="satisfactionRating"
						render={({ field }) => (
							<FormItem className="mb-6">
								<FormLabel className="text-lg">今日の満足度</FormLabel>
								<FormControl>
									<StarRating
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* エネルギーレベル */}
					<FormField
						control={form.control}
						name="energyLevel"
						render={({ field }) => (
							<FormItem className="mb-6">
								<FormLabel className="text-lg">終業時のエネルギー</FormLabel>
								<FormControl>
									<StarRating
										value={field.value || 3}
										onChange={field.onChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 達成できたこと */}
					<FormField
						control={form.control}
						name="achievements"
						render={({ field }) => (
							<FormItem className="mb-6">
								<FormLabel className="text-lg">達成できたこと</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder="今日成し遂げたことを記録しましょう..."
										rows={3}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 課題や困難 */}
					<FormField
						control={form.control}
						name="challenges"
						render={({ field }) => (
							<FormItem className="mb-6">
								<FormLabel className="text-lg">課題や困難</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder="直面した課題や困難を記録しましょう..."
										rows={3}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 学んだこと */}
					<FormField
						control={form.control}
						name="learnings"
						render={({ field }) => (
							<FormItem className="mb-6">
								<FormLabel className="text-lg">学んだこと</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder="今日学んだことを記録しましょう..."
										rows={3}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 明日の優先事項 */}
					<FormField
						control={form.control}
						name="tomorrowPriorities"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-lg">明日の優先事項</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder="明日取り組みたいことを記録しましょう..."
										rows={3}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</Card>

				<Button
					type="submit"
					size="lg"
					className="w-full"
					disabled={createMutation.isPending}
				>
					{createMutation.isPending ? '保存中...' : '振り返りを保存'}
				</Button>
			</form>
		</Form>
	);
}
