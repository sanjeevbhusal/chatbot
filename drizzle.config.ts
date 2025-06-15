import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { environmentVariables } from "@/lib/env";

export default defineConfig({
	out: "./drizzle",
	schema: "./drizzle/schema.ts",
	dialect: "turso",
	dbCredentials: {
		url: environmentVariables.TURSO_DATABASE_URL,
		authToken: environmentVariables.TURSO_AUTH_TOKEN,
	},
});
