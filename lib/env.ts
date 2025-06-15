import z from "zod";

const variables = z.object({
	TURSO_DATABASE_URL: z.string(),
	TURSO_AUTH_TOKEN: z.string(),
	OPENAI_API_KEY: z.string(),
	OPENAI_MODEL: z.string(),
	CLOUDINARY_URL: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string(),
});

export const environmentVariables = variables.parse(process.env);
