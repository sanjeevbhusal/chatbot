import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { account, session, usersTable, verification } from "@/drizzle/schema";
import { environmentVariables } from "./env";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: {
			user: usersTable,
			session,
			account,
			verification,
		},
	}),
	socialProviders: {
		google: {
			clientId: environmentVariables.GOOGLE_CLIENT_ID,
			clientSecret: environmentVariables.GOOGLE_CLIENT_SECRET,
		},
	},
});
