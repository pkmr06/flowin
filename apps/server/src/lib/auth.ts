import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { sendMagicLinkEmail } from "../services/email";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
	},
	emailVerification: {
		enabled: true,
		sendVerificationEmail: async ({ user, url, token }) => {
			await sendMagicLinkEmail({
				to: user.email,
				magicLink: url,
				token,
			});
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	trustedOrigins: [
		process.env.APP_URL || "http://localhost:3001",
	],
});

export type Session = typeof auth.$Infer.Session;
