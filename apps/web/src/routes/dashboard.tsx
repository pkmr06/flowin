import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/login",
				throw: true,
			});
		}
		const { data: customerState } = await authClient.customer.state();
		return { session: session.data, customerState };
	},
});

function RouteComponent() {
	// const routeContext = Route.useRouteContext();

	// const privateData = trpc.auth.session.useQuery();

	// const hasProSubscription = routeContext?.customerState?.activeSubscriptions?.length! > 0;
	// console.log("Active subscriptions:", routeContext?.customerState?.activeSubscriptions);

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome User</p>
			{/* <p>API: {privateData.data?.user?.email}</p> */}
			{/* <p>Plan: {hasProSubscription ? "Pro" : "Free"}</p> */}
			{/* {hasProSubscription ? (
				<Button onClick={async () => await authClient.customer.portal()}>
					Manage Subscription
				</Button>
			) : (
				<Button
					onClick={async () => await authClient.checkout({ slug: "pro" })}
				>
					Upgrade to Pro
				</Button>
			)} */}
		</div>
	);
}
