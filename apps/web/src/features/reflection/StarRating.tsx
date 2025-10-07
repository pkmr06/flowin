import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
	value: number;
	onChange: (value: number) => void;
	max?: number;
	readonly?: boolean;
}

export function StarRating({ value, onChange, max = 5, readonly = false }: StarRatingProps) {
	return (
		<div className="flex gap-1">
			{[...Array(max)].map((_, index) => {
				const starValue = index + 1;
				const isFilled = starValue <= value;

				return (
					<button
						key={index}
						type="button"
						onClick={() => !readonly && onChange(starValue)}
						disabled={readonly}
						className={cn(
							'transition-colors',
							!readonly && 'hover:scale-110 cursor-pointer',
							readonly && 'cursor-default'
						)}
					>
						<Star
							className={cn(
								'h-8 w-8',
								isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
							)}
						/>
					</button>
				);
			})}
		</div>
	);
}
