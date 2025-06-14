import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { embeddings } from "@/app/api/utils";
import { createClient } from "@libsql/client";
import { writeFileSync } from "node:fs";

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
	throw new Error("Missing environment variables");
}

export const dbClient = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
});

dbClient.execute("PRAGMA foreign_keys = ON;");

export const db = drizzle(dbClient);

async function main() {
	// await db.run(sql`
	// 	CREATE INDEX IF NOT EXISTS vector_index ON documents_chunk (vector) USING vector_cosine(1536);
	// `);

	// Create a new user.
	// const user = await db
	// 	.insert(usersTable)
	// 	.values({
	// 		name: "Sanjeev Bhusal",
	// 		email: "bhusalsanjeev23@gmail.com",
	// 		password: "test",
	// 	})
	// 	.returning();

	// Create new users document table.
	// const usersDocumentTable = await db
	// 	.insert(userDocumentsTable)
	// 	.values({
	// 		userId: user[0].id,
	// 		name: "Document 1",
	// 		url: "https://czbpl3fegf.ufs.sh/f/9Fa5WQOwIk2bqPg9QqQ0aSQnYCoIVUhBFD6lRzygKZLm2t0M",
	// 	})
	// 	.returning();

	// Take embeddings of a document.
	// const response = await embeddings.embedDocuments([
	// 	"I am currently working as a Sofware Engineer",
	// ]);
	// const vector = response[0];
	// const response = await embeddings.embedQuery("What is my job?");

	// writeFileSync("./vector.txt", JSON.stringify(response), "utf-8");

	// Create new documents chunk table.
	// await db.insert(documentsChunkTable).values([
	// 	{
	// 		userDocumentId: 1,
	// 		content: "I am currently working as a Sofware Engineer",
	// 		metadata: "",
	// 		vector: sql`vector32(${JSON.stringify(vector)})`,
	// 	},
	// ]);

	const question = "What is my and my father's name? ";
	const questionEmbeddings = await embeddings.embedQuery(question);
	writeFileSync("./vector.txt", JSON.stringify(questionEmbeddings), "utf-8");
	// const topK = await db
	// 	.select({
	// 		id: sql`documents_chunk.id`,
	// 		content: sql`content`,
	// 	})
	// 	.from(
	// 		sql`vector_top_k('vector_index', vector32(${JSON.stringify(questionEmbeddings)}), 3)`,
	// 	)
	// 	.leftJoin(
	// 		documentsChunkTable,
	// 		sql`${documentsChunkTable}.id = vector_top_k.id`,
	// 	);

	// const sources = topK.map((doc) => doc.content).join("\n");
	// const userMessage = {
	// 	role: "user",
	// 	content: `${question}\n Sources: ${sources}`,
	// };
	// const response = await chatModel.invoke([userMessage]);
}

main();
