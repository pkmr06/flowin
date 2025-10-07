import { TRPCError } from '@trpc/server';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

const validTransitions: Record<TaskStatus, TaskStatus[]> = {
	pending: ['in_progress', 'cancelled'],
	in_progress: ['completed', 'cancelled'],
	completed: [], // 完了後は変更不可
	cancelled: [], // キャンセル後は変更不可
};

export function validateStatusTransition(
	currentStatus: TaskStatus,
	newStatus: TaskStatus
): void {
	if (currentStatus === newStatus) {
		return; // 同じステータスへの変更は許可
	}

	const allowedTransitions = validTransitions[currentStatus];

	if (!allowedTransitions.includes(newStatus)) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `ステータスを ${currentStatus} から ${newStatus} に変更できません`,
		});
	}
}

export function shouldSetCompletedAt(
	currentStatus: TaskStatus,
	newStatus: TaskStatus
): boolean {
	return newStatus === 'completed' && currentStatus !== 'completed';
}

export function calculateActualDuration(
	createdAt: Date,
	completedAt: Date
): number {
	const durationMs = completedAt.getTime() - createdAt.getTime();
	return Math.round(durationMs / 1000 / 60); // 分単位
}
