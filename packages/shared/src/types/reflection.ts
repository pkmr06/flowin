export interface Reflection {
	id: string;
	userId: string;
	dailyPlanId: string;
	completedTasksCount: number;
	totalTasksCount: number;
	satisfactionRating: number; // 1-5
	energyLevel?: number; // 1-5
	achievements?: string;
	challenges?: string;
	learnings?: string;
	tomorrowPriorities?: string;
	createdAt: Date;
	updatedAt: Date;
}
