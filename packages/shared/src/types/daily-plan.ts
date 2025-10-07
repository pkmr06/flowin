export interface DailyPlan {
	id: string;
	userId: string;
	planDate: string; // YYYY-MM-DD
	totalPlannedMinutes: number;
	workStartTime: string; // HH:MM
	workEndTime: string; // HH:MM
	isFinalized: boolean;
	finalizedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface TimeBlock {
	id: string;
	taskId: string;
	dailyPlanId: string;
	startTime: Date;
	endTime: Date;
	plannedDurationMinutes: number;
	actualDurationMinutes?: number;
	sortOrder: number;
	notes?: string;
	status: 'planned' | 'active' | 'completed' | 'skipped' | 'overrun';
	createdAt: Date;
	updatedAt: Date;
}

export type TimeBlockStatus = TimeBlock['status'];

export interface DailyPlanSummary {
	totalPlannedMinutes: number;
	availableMinutes: number;
	isOverallocated: boolean;
	warningMessage?: string;
	timeBlockCount: number;
}
