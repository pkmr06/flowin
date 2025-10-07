import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/components/auth/LoginForm';
import { Sparkles, CheckCircle2, Zap, BarChart3 } from 'lucide-react';

function LoginPage() {
	return (
		<div className="min-h-screen flex">
			{/* Left Side - Login Form */}
			<div className="flex-1 flex items-center justify-center p-8 bg-background">
				<div className="w-full max-w-md space-y-8">
					{/* Logo & Title */}
					<div className="text-center space-y-2">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
							<Sparkles className="h-8 w-8 text-primary" />
						</div>
						<h1 className="text-4xl font-bold tracking-tight">Flowin</h1>
						<p className="text-lg text-muted-foreground">
							タスクと時間を、フローに変える
						</p>
					</div>

					{/* Login Form */}
					<div className="bg-card border border-border rounded-xl p-8 shadow-sm">
						<LoginForm />
					</div>

					{/* Footer */}
					<p className="text-center text-sm text-muted-foreground">
						パスワード不要のマジックリンクでログイン
					</p>
				</div>
			</div>

			{/* Right Side - Feature Showcase */}
			<div className="hidden lg:flex flex-1 bg-neutral-50 dark:bg-neutral-900 p-12 items-center justify-center">
				<div className="max-w-lg space-y-12">
					<div>
						<h2 className="text-3xl font-bold mb-4">
							集中して、達成する。
						</h2>
						<p className="text-lg text-muted-foreground leading-relaxed">
							Flowinは、デイリープランニングとフォーカス実行を統合した、
							新しいタスク管理ツールです。
						</p>
					</div>

					<div className="space-y-6">
						<FeatureItem
							icon={<CheckCircle2 className="h-6 w-6 text-success" />}
							title="デイリープランニング"
							description="毎朝5分で今日の作業を整理。過剰な計画を防ぐスマートな警告機能"
						/>
						<FeatureItem
							icon={<Zap className="h-6 w-6 text-warning" />}
							title="フォーカスモード"
							description="ポモドーロタイマーで集中力を維持。1タスクに没頭できる環境"
						/>
						<FeatureItem
							icon={<BarChart3 className="h-6 w-6 text-info" />}
							title="振り返りと分析"
							description="日次・週次の振り返りで継続的に改善。データで成長を実感"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
	return (
		<div className="flex gap-4">
			<div className="flex-shrink-0 w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
				{icon}
			</div>
			<div className="flex-1">
				<h3 className="font-semibold mb-1">{title}</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
			</div>
		</div>
	);
}

export const Route = createFileRoute('/auth/login')({
	component: LoginPage,
});
