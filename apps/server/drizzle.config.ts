import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema",
	out: "./src/db/migrations",
	dialect: "turso",
	dbCredentials: {
		url: process.env.DATABASE_URL || "file:./dev.db",
		authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
	},
});
