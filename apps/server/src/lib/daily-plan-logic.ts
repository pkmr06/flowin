import { TRPCError } from '@trpc/server';

/**
 * 作業時間の合計を計算
 */
export function calculateTotalPlannedMinutes(
	timeBlocks: Array<{ plannedDurationMinutes: number }>
): number {
	return timeBlocks.reduce((sum, block) => sum + block.plannedDurationMinutes, 0);
}

/**
 * 6時間（360分）超過チェック
 */
export function checkOverallocation(totalMinutes: number): {
	isOverallocated: boolean;
	warningMessage?: string;
} {
	const RECOMMENDED_MAX_MINUTES = 360; // 6時間

	if (totalMinutes <= RECOMMENDED_MAX_MINUTES) {
		return { isOverallocated: false };
	}

	const hoursOver = Math.round((totalMinutes - RECOMMENDED_MAX_MINUTES) / 60 * 10) / 10;

	return {
		isOverallocated: true,
		warningMessage: `推奨作業時間（6時間）を${hoursOver}時間超過しています。タスクを減らすか、時間を調整することをお勧めします。`,
	};
}

/**
 * 時刻文字列から分を計算（"09:00" → 540）
 */
export function timeStringToMinutes(time: string): number {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
}

/**
 * 作業可能時間を計算
 */
export function calculateAvailableMinutes(
	workStartTime: string,
	workEndTime: string
): number {
	const startMinutes = timeStringToMinutes(workStartTime);
	const endMinutes = timeStringToMinutes(workEndTime);

	if (endMinutes <= startMinutes) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: '終了時刻は開始時刻より後である必要があります',
		});
	}

	return endMinutes - startMinutes;
}

/**
 * タイムブロックの重複チェック
 */
export function checkTimeBlockOverlap(
	timeBlocks: Array<{ startTime: Date; endTime: Date }>,
	newBlock: { startTime: Date; endTime: Date }
): boolean {
	return timeBlocks.some(block => {
		const blockStart = block.startTime.getTime();
		const blockEnd = block.endTime.getTime();
		const newStart = newBlock.startTime.getTime();
		const newEnd = newBlock.endTime.getTime();

		// 重複パターン
		return (
			(newStart >= blockStart && newStart < blockEnd) ||
			(newEnd > blockStart && newEnd <= blockEnd) ||
			(newStart <= blockStart && newEnd >= blockEnd)
		);
	});
}

/**
 * 日付文字列を取得（YYYY-MM-DD）
 */
export function getDateString(date: Date): string {
	return date.toISOString().split('T')[0];
}
