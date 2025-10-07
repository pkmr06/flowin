import { Link, useRouterState } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import {
	Home,
	LayoutDashboard,
	CheckSquare,
	Target,
	BarChart3,
	Calendar,
	Settings,
	LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export default function Sidebar() {
	const router = useRouterState();
	const currentPath = router.location.pathname;

	const mainLinks = [
		{ to: "/", label: "ホーム", icon: Home },
		{ to: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
		{ to: "/tasks", label: "タスク", icon: CheckSquare },
		{ to: "/focus", label: "フォーカス", icon: Target },
		{ to: "/analytics", label: "分析", icon: BarChart3 },
	] as const;

	const bottomLinks = [
		// { to: "/settings", label: "設定", icon: Settings },
	] as const;

	const isActive = (path: string) => {
		if (path === "/") {
			return currentPath === "/";
		}
		return currentPath.startsWith(path);
	};

	return (
		<aside className="flex flex-col w-64 h-screen bg-background border-r border-border">
			{/* Logo/Brand */}
			<div className="flex items-center gap-3 px-6 py-5">
				<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
					<Target className="h-5 w-5 text-primary-foreground" />
				</div>
				<span className="text-xl font-semibold">Flowin</span>
			</div>

			<Separator />

			{/* Main Navigation */}
			<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
				{mainLinks.map(({ to, label, icon: Icon }) => (
					<Link
						key={to}
						to={to}
						className={cn(
							"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
							isActive(to)
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
						)}
					>
						<Icon className="h-4 w-4" />
						<span>{label}</span>
					</Link>
				))}
			</nav>

			<Separator />

			{/* Bottom Section */}
			<div className="px-3 py-4 space-y-2">
				{/* TODO: 設定画面ができたら有効化
				{bottomLinks.map(({ to, label, icon: Icon }) => (
					<Link
						key={to}
						to={to}
						className={cn(
							"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
							isActive(to)
								? "bg-accent text-accent-foreground"
								: "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
						)}
					>
						<Icon className="h-4 w-4" />
						<span>{label}</span>
					</Link>
				))}
				*/}

				<div className="flex items-center gap-2 px-3 py-2">
					<ModeToggle />
				</div>

				<Separator className="my-2" />

				{/* User Menu */}
				<div className="px-3">
					<UserMenu />
				</div>
			</div>
		</aside>
	);
}
