import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { trpc } from '@/utils/trpc';
import { Loader2, XCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

function VerifyMagicLink() {
	const navigate = useNavigate();
	const searchParams = useSearch({ from: '/auth/verify' });
	const token = searchParams.token as string;

	const verifyMagicLink = trpc.auth.verifyMagicLink.useMutation({
		onSuccess: () => {
			// オンボーディング状態を確認してリダイレクト
			navigate({ to: '/onboarding/demo' });
		},
		onError: (error) => {
			console.error('Verification failed:', error);
		},
	});

	useEffect(() => {
		if (token) {
			verifyMagicLink.mutate({ token });
		}
	}, [token]);

	if (verifyMagicLink.error) {
		return (
			<div className="flex items-center justify-center min-h-screen p-8 bg-background">
				<div className="w-full max-w-md">
					<div className="text-center space-y-6">
						<div className="flex justify-center">
							<div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
								<XCircle className="h-10 w-10 text-destructive" />
							</div>
						</div>
						<div className="space-y-3">
							<h2 className="text-2xl font-semibold">認証に失敗しました</h2>
							<div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
								<p className="text-sm text-destructive">
									{verifyMagicLink.error.message}
								</p>
							</div>
							<p className="text-base text-muted-foreground">
								リンクが期限切れか無効です。<br />
								再度ログインしてください。
							</p>
						</div>
						<Button
							onClick={() => navigate({ to: '/login' })}
							size="lg"
							className="w-full h-12 text-base font-medium"
						>
							ログインページに戻る
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen p-8 bg-background">
			<div className="w-full max-w-md">
				<div className="text-center space-y-6">
					<div className="flex justify-center">
						<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
							<Loader2 className="h-10 w-10 animate-spin text-primary" />
						</div>
					</div>
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold">ログイン処理中</h2>
						<p className="text-base text-muted-foreground">
							少々お待ちください...
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/auth/verify')({
	component: VerifyMagicLink,
	validateSearch: (search: Record<string, unknown>) => ({
		token: search.token as string,
	}),
});
