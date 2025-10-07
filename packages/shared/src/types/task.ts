// Base task interface (database representation)
export interface Task {
	id: string;
	userId: string;
	title: string;
	description?: string | null;
	estimatedDurationMinutes: number;
	actualDurationMinutes?: number | null;
	priority: 'high' | 'medium' | 'low';
	status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
	completedAt?: Date | string | null;
	createdAt: Date | string;
	updatedAt: Date | string;
}

export type TaskPriority = Task['priority'];
export type TaskStatus = Task['status'];

export interface TaskSummary {
	total: number;
	pending: number;
	inProgress: number;
	completed: number;
	cancelled: number;
}
