import { router, publicProcedure } from '../lib/trpc';
import { z } from 'zod';
import { auth } from '../lib/auth';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
	sendMagicLink: publicProcedure
		.input(z.object({
			email: z.string().email('有効なメールアドレスを入力してください'),
		}))
		.mutation(async ({ input }) => {
			try {
				// Better-Authのメール送信APIを使用
				await auth.api.sendVerificationEmail({
					body: {
						email: input.email,
					},
				});

				return {
					success: true,
					message: 'メールを送信しました。受信トレイを確認してください。',
				};
			} catch (error) {
				console.error('Magic link error:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'マジックリンクの送信に失敗しました',
				});
			}
		}),

	verifyMagicLink: publicProcedure
		.input(z.object({
			token: z.string(),
		}))
		.mutation(async ({ input, ctx }) => {
			try {
				const session = await auth.api.verifyEmail({
					query: {
						token: input.token,
					},
				});

				if (!session) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: '無効なトークンです',
					});
				}

				return {
					success: true,
					user: session.user,
				};
			} catch (error) {
				console.error('Verification error:', error);
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'トークンの検証に失敗しました',
				});
			}
		}),

	getSession: publicProcedure
		.query(async ({ ctx }) => {
			return ctx.session;
		}),

	signOut: publicProcedure
		.mutation(async ({ ctx }) => {
			if (ctx.session) {
				await auth.api.signOut({
					headers: new Headers(),
				});
			}
			return { success: true };
		}),
});
