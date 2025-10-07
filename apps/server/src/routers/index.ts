import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { authRouter } from "./auth";
import { onboardingRouter } from "./onboarding";
import { tasksRouter } from "./tasks";
import { dailyPlansRouter } from "./daily-plans";
import { reflectionsRouter } from "./reflections";
import { analyticsRouter } from "./analytics";
import { exportRouter } from "./export";

export const appRouter = router({
	auth: authRouter,
	onboarding: onboardingRouter,
	tasks: tasksRouter,
	dailyPlans: dailyPlansRouter,
	reflections: reflectionsRouter,
	analytics: analyticsRouter,
	export: exportRouter,
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
});
export type AppRouter = typeof appRouter;
