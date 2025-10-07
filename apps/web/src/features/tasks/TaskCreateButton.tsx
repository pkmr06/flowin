import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskFormModal } from './TaskFormModal';

interface TaskCreateButtonProps {
	variant?: 'default' | 'outline' | 'ghost';
}

export function TaskCreateButton({ variant = 'default' }: TaskCreateButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button
				variant={variant}
				size="default"
				onClick={() => setIsOpen(true)}
			>
				<Plus className="h-4 w-4 mr-2" />
				新規タスク
			</Button>

			<TaskFormModal
				mode="create"
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
			/>
		</>
	);
}
