import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { environmentVariables } from "./env";

export const dbClient = createClient({
	url: environmentVariables.TURSO_DATABASE_URL,
	authToken: environmentVariables.TURSO_AUTH_TOKEN,
});

export const db = drizzle(dbClient);
