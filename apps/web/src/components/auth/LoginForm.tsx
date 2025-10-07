import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/utils/trpc';
import { Mail, CheckCircle } from 'lucide-react';

export function LoginForm() {
	const [email, setEmail] = useState('');
	const [submitted, setSubmitted] = useState(false);

	const sendMagicLink = trpc.auth.sendMagicLink.useMutation({
		onSuccess: () => {
			setSubmitted(true);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMagicLink.mutate({ email });
	};

	if (submitted) {
		return (
			<div className="text-center space-y-6 py-4">
				<div className="flex justify-center">
					<div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
						<CheckCircle className="h-8 w-8 text-success" />
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">メールを確認してください</h2>
					<p className="text-base text-muted-foreground">
						<span className="font-medium text-foreground">{email}</span> にログインリンクを送信しました。
					</p>
				</div>
				<div className="rounded-lg bg-muted/50 p-4 space-y-2">
					<p className="text-sm text-muted-foreground">
						📧 メールが届かない場合は、迷惑メールフォルダをご確認ください
					</p>
					<p className="text-sm text-muted-foreground">
						⏱️ リンクは30分間有効です
					</p>
				</div>
				<Button
					variant="ghost"
					onClick={() => {
						setSubmitted(false);
						setEmail('');
					}}
					className="text-sm"
				>
					別のメールアドレスを使用
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-3">
				<label htmlFor="email" className="block text-sm font-medium text-foreground">
					メールアドレス
				</label>
				<div className="relative">
					<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="your@email.com"
						required
						className="pl-10 h-12 text-base"
						autoFocus
					/>
				</div>
				<p className="text-xs text-muted-foreground leading-relaxed">
					🔒 パスワードは不要です。メールアドレスだけでログインできます
				</p>
			</div>

			<Button
				type="submit"
				className="w-full h-12 text-base font-medium"
				disabled={sendMagicLink.isPending || !email}
				size="lg"
			>
				{sendMagicLink.isPending ? (
					<span className="flex items-center gap-2">
						<span className="animate-spin">⏳</span>
						送信中...
					</span>
				) : (
					'ログインリンクを送信'
				)}
			</Button>

			{sendMagicLink.error && (
				<div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
					<p className="text-sm text-destructive text-center">
						{sendMagicLink.error.message}
					</p>
				</div>
			)}
		</form>
	);
}
