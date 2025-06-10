import { ourFileRouter } from "@/app/api/uploadthing/core";
import {
	documentsChunkTable,
	userDocumentsTable,
	usersTable,
} from "@/drizzle/schema";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { Document } from "@langchain/core/documents";
import { embeddings, splitDocument, vectorStore } from "@/app/api/utils";
import { sql } from "drizzle-orm/sql";
import { createClient } from "@libsql/client";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
	throw new Error("Missing environment variables");
}

export const dbClient = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(dbClient);

async function main() {
	await db.run(sql`
		CREATE INDEX IF NOT EXISTS vector_index ON documents_chunk (vector) USING vector_cosine(1536);
	`);

	// Create a new user.
	// const user = await db
	// 	.insert(usersTable)
	// 	.values({
	// 		name: "Sanjeev Bhusal",
	// 		email: "bhusalsanjeev23@gmail.com",
	// 		password: "test",
	// 	})
	// 	.returning();

	// // Create new users document table.
	// const usersDocumentTable = await db
	// 	.insert(userDocumentsTable)
	// 	.values({
	// 		userId: user[0].id,
	// 		name: "Document 1",
	// 		url: "https://czbpl3fegf.ufs.sh/f/9Fa5WQOwIk2bqPg9QqQ0aSQnYCoIVUhBFD6lRzygKZLm2t0M",
	// 	})
	// 	.returning();

	// // Take embeddings of a document.
	// const response = await embeddings.embedDocuments([
	// 	"My name is Sanjeev Bhusal",
	// ]);
	// const vector = response[0];

	// // Create new documents chunk table.
	// await db.insert(documentsChunkTable).values([
	// 	{
	// 		userDocumentId: usersDocumentTable[0].id,
	// 		content: "My name is Sanjeev Bhusal",
	// 		metadata: "",
	// 		vector: sql`vector32(${JSON.stringify(vector)})`,
	// 	},
	// ]);
}

main();
