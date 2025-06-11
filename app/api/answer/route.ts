import type { NextRequest } from "next/server";
import { chatModel, embeddings } from "../utils";
import { db } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import {
	documentsChunkTable,
	messageSourcesTable,
	usersMessagesTable,
} from "@/drizzle/schema";

const systemMessage = {
	role: "system",
	content:
		"You are an assistant for question-answering tasks. Use the context provided to answer each question. If you don't know the answer, say that you don't know. Use three sentences maximum and keep the answer concise.",
};

export async function GET(request: Request) {
	const messages = await db
		.select()
		.from(usersMessagesTable)
		.orderBy(usersMessagesTable.createdAt)
		.leftJoin(
			messageSourcesTable,
			eq(messageSourcesTable.messageId, usersMessagesTable.id),
		)
		.leftJoin(
			documentsChunkTable,
			eq(documentsChunkTable.id, messageSourcesTable.documentChunkId),
		);

	const messageIdToSources: Record<
		number,
		(typeof documentsChunkTable.$inferSelect)[]
	> = {};

	for (const message of messages) {
		const messageId = message.users_messages.id;
		const source = message.documents_chunk;
		if (source) {
			const sources = messageIdToSources[messageId];
			if (sources) {
				sources.push(source);
			} else {
				messageIdToSources[messageId] = [source];
			}
		}
	}

	const seenMessages = new Set<number>();
	const serializedMessages = [];
	for (const message of messages) {
		if (seenMessages.has(message.users_messages.id)) {
			continue;
		}

		seenMessages.add(message.users_messages.id);
		serializedMessages.push({
			id: message.users_messages.id,
			content: message.users_messages.content,
			role: message.users_messages.role,
			createdAt: message.users_messages.createdAt,
			sources: (messageIdToSources[message.users_messages.id] ?? []).map(
				(source) => {
					const metadata = JSON.parse(source.metadata ?? "{}");
					return {
						name: metadata.name,
						linesFrom: metadata.loc?.lines?.from,
						linesTo: metadata.loc?.lines?.to,
						userDocumentId: source.userDocumentId,
					};
				},
			),
		});
	}
	return Response.json({ result: serializedMessages });
}

export async function POST(request: NextRequest) {
	const body = await request.json();
	const question = body.question as string;

	if (!question) {
		return new Response("Question not provided", { status: 400 });
	}

	const questionEmbeddings = await embeddings.embedQuery(question);
	const documentsChunk = await db
		.select({
			id: sql`documents_chunk.id`,
			content: sql`content`,
		})
		.from(
			sql`vector_top_k('vector_index', vector32(${JSON.stringify(questionEmbeddings)}), 3)`,
		)
		.leftJoin(
			documentsChunkTable,
			sql`${documentsChunkTable}.id = vector_top_k.id`,
		);

	const sources = documentsChunk.map((chunk) => chunk.content).join("\n");

	// add this user asked message to database.
	await db.insert(usersMessagesTable).values({
		userId: 1,
		content: question,
		role: "user",
		createdAt: new Date().toISOString(),
	});

	// fetch all user messages.
	const usersMessages = await db
		.select()
		.from(usersMessagesTable)
		.orderBy(usersMessagesTable.createdAt);

	// change the last message by also adding sources.
	const lastMessage = usersMessages[usersMessages.length - 1];
	lastMessage.content = `${question}\n Sources: ${sources}`;

	// build messages array to supply to llm. add system Message as the first message
	const messages = [systemMessage, ...usersMessages.slice(0, -1), lastMessage];

	const response = await chatModel.invoke(messages);

	// add response and sources to messages table
	const message = await db
		.insert(usersMessagesTable)
		.values({
			userId: 1,
			role: "assistant",
			content: response.content,
			createdAt: new Date().toISOString(),
		})
		.returning();

	// add sources to database.
	await db.insert(messageSourcesTable).values(
		documentsChunk.map((chunk) => ({
			messageId: message[0].id,
			documentChunkId: chunk.id as number,
		})),
	);

	return Response.json({ result: response.content });
}
