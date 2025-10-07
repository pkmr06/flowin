import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Loader2 } from 'lucide-react';

interface ExportDialogProps {
	children: React.ReactNode;
}

export function ExportDialog({ children }: ExportDialogProps) {
	const [open, setOpen] = useState(false);
	const [format, setFormat] = useState<'csv' | 'json'>('csv');
	const [dataType, setDataType] = useState<'tasks' | 'reflections'>('tasks');

	const exportTasks = trpc.export.exportTasks.useQuery(
		{ format },
		{ enabled: false }
	);

	const exportReflections = trpc.export.exportReflections.useQuery(
		{ format },
		{ enabled: false }
	);

	const handleExport = async () => {
		let result;
		
		if (dataType === 'tasks') {
			result = await exportTasks.refetch();
		} else {
			result = await exportReflections.refetch();
		}

		if (result.data) {
			const blob = new Blob([result.data.data], { 
				type: format === 'csv' ? 'text/csv' : 'application/json' 
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = result.data.filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			setOpen(false);
		}
	};

	const isLoading = exportTasks.isFetching || exportReflections.isFetching;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children}
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>データをエクスポート</DialogTitle>
					<DialogDescription>
						データの種類とフォーマットを選択してください
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* データタイプ選択 */}
					<div className="space-y-2">
						<Label>データの種類</Label>
						<RadioGroup value={dataType} onValueChange={(v) => setDataType(v as any)}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="tasks" id="tasks" />
								<Label htmlFor="tasks" className="font-normal cursor-pointer">
									タスク
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="reflections" id="reflections" />
								<Label htmlFor="reflections" className="font-normal cursor-pointer">
									振り返り
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* フォーマット選択 */}
					<div className="space-y-2">
						<Label>フォーマット</Label>
						<RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="csv" id="csv" />
								<Label htmlFor="csv" className="font-normal cursor-pointer">
									CSV
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="json" id="json" />
								<Label htmlFor="json" className="font-normal cursor-pointer">
									JSON
								</Label>
							</div>
						</RadioGroup>
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={() => setOpen(false)}>
						キャンセル
					</Button>
					<Button onClick={handleExport} disabled={isLoading} className="gap-2">
						{isLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Download className="h-4 w-4" />
						)}
						エクスポート
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
