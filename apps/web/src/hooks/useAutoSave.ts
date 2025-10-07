import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveOptions<T> {
	data: T;
	onSave: (data: T) => void | Promise<void>;
	delay?: number;
	enabled?: boolean;
}

export function useAutoSave<T>({
	data,
	onSave,
	delay = 500,
	enabled = true,
}: UseAutoSaveOptions<T>) {
	const debouncedData = useDebounce(data, delay);
	const isFirstRender = useRef(true);

	useEffect(() => {
		// 初回レンダリングはスキップ
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (enabled) {
			onSave(debouncedData);
		}
	}, [debouncedData, enabled]);
}
