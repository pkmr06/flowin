import { router, publicProcedure } from '../lib/trpc';

export const onboardingRouter = router({
	completeDemo: publicProcedure.mutation(async () => {
		// デモ完了をログ記録（将来的にはユーザー設定に保存）
		console.log('Demo completed');
		return { success: true };
	}),
});
