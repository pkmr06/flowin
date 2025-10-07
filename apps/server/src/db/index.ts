import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// ローカル開発環境のデフォルトデータベースURL
const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

const client = createClient({
	url: DATABASE_URL,
	authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
});

export const db = drizzle({ client, schema });
