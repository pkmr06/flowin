import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/utils/trpc';
import type { Task } from '@/../../packages/shared/src/types/task';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const formSchema = z.object({
	title: z.string()
		.min(1, 'タイトルは必須です')
		.max(200, 'タイトルは200文字以内で入力してください'),
	description: z.string()
		.max(2000, '説明は2000文字以内で入力してください')
		.optional(),
	estimatedDurationMinutes: z.number()
		.int('整数で入力してください')
		.min(15, '最小15分から設定できます')
		.max(480, '最大8時間まで設定できます'),
	priority: z.enum(['high', 'medium', 'low']),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormModalProps {
	mode: 'create' | 'edit';
	task?: Task;
	isOpen: boolean;
	onClose: () => void;
}

export function TaskFormModal({ mode, task, isOpen, onClose }: TaskFormModalProps) {
	const utils = trpc.useUtils();

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: task?.title || '',
			description: task?.description || '',
			estimatedDurationMinutes: task?.estimatedDurationMinutes || 30,
			priority: task?.priority || 'medium',
		},
	});

	const createMutation = trpc.tasks.create.useMutation({
		onSuccess: () => {
			utils.tasks.list.invalidate();
			form.reset();
			localStorage.removeItem('task-draft');
			onClose();
		},
	});

	const updateMutation = trpc.tasks.update.useMutation({
		onSuccess: () => {
			utils.tasks.list.invalidate();
			if (task) {
				utils.tasks.getById.invalidate({ id: task.id });
			}
			onClose();
		},
	});

	const onSubmit = (data: FormValues) => {
		if (mode === 'create') {
			createMutation.mutate(data);
		} else if (task) {
			updateMutation.mutate({
				id: task.id,
				...data,
			});
		}
	};

	// モーダルが開いたらタイトル入力にフォーカス
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				const input = document.querySelector('input[name="title"]') as HTMLInputElement;
				input?.focus();
			}, 100);
		}
	}, [isOpen]);

	// 自動保存（下書き）
	useEffect(() => {
		const subscription = form.watch((value) => {
			if (mode === 'create' && value.title) {
				localStorage.setItem('task-draft', JSON.stringify(value));
			}
		});
		return () => subscription.unsubscribe();
	}, [form, mode]);

	// 下書き復元
	useEffect(() => {
		if (mode === 'create' && isOpen) {
			const draft = localStorage.getItem('task-draft');
			if (draft) {
				try {
					const parsed = JSON.parse(draft);
					form.reset(parsed);
				} catch (e) {
					console.error('Failed to restore draft', e);
				}
			}
		}
	}, [mode, isOpen, form]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold">
						{mode === 'create' ? '新規タスク作成' : 'タスク編集'}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
						{/* タイトル */}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium">タイトル *</FormLabel>
									<FormControl>
										<Input
											placeholder="例: プレゼン資料を完成させる"
											className="h-11 text-base"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* 説明 */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium">説明</FormLabel>
									<FormControl>
										<Textarea
											placeholder="タスクの詳細を入力..."
											rows={4}
											className="text-base resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							{/* 所要時間 */}
							<FormField
								control={form.control}
								name="estimatedDurationMinutes"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">予想所要時間</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={String(field.value)}
										>
											<FormControl>
												<SelectTrigger className="h-11">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="15">15分</SelectItem>
												<SelectItem value="30">30分</SelectItem>
												<SelectItem value="45">45分</SelectItem>
												<SelectItem value="60">1時間</SelectItem>
												<SelectItem value="90">1時間30分</SelectItem>
												<SelectItem value="120">2時間</SelectItem>
												<SelectItem value="180">3時間</SelectItem>
												<SelectItem value="240">4時間</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* 優先度 */}
							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">優先度</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="h-11">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="high">🔴 高</SelectItem>
												<SelectItem value="medium">🟡 中</SelectItem>
												<SelectItem value="low">🟢 低</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter className="gap-2 mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={createMutation.isPending || updateMutation.isPending}
								className="h-11"
							>
								キャンセル
							</Button>
							<Button
								type="submit"
								disabled={createMutation.isPending || updateMutation.isPending}
								className="h-11 font-medium"
							>
								{(createMutation.isPending || updateMutation.isPending)
									? '保存中...'
									: mode === 'create' ? '作成' : '保存'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
