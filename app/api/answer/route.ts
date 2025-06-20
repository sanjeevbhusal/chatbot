import type { NextRequest } from "next/server";
import { chatModel, embeddings } from "../utils";
import { db } from "@/lib/db";
import { and, eq, sql } from "drizzle-orm";
import {
	documentsChunkTable,
	messageSourcesTable,
	messageThreadTable,
	usersMessagesTable,
} from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const systemMessage = {
	role: "system",
	content:
		"You are an conversational assistant responsible for answering question on behalf of SecurityPal company. User will ask you questions related to SecurityPal company's products and services. Each question will have sources. A source is a part of a document. You should read the sources in detail and generate a answer. If you don't find the answer in the sources, say that you don't know. Use three sentences maximum and keep the answer concise.",
};

export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user.id;

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const threadId = Number(request.nextUrl.searchParams.get("threadId"));
	if (!threadId) {
		return Response.json({ error: "Thread Id is required" }, { status: 400 });
	}

	const messages = await db
		.select()
		.from(usersMessagesTable)
		.where(
			and(
				eq(usersMessagesTable.threadId, threadId),
				eq(usersMessagesTable.userId, userId),
			),
		)
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
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user.id;

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const question = body.question as string;
	const selectedDocumentIds = body.selectedDocumentIds as number[];
	let threadId = body.threadId as number | undefined;

	if (threadId) {
		const exists = await db
			.select({ id: messageThreadTable.id })
			.from(messageThreadTable)
			.where(
				and(
					eq(messageThreadTable.id, threadId),
					eq(messageThreadTable.userId, userId),
				),
			)
			.limit(1);

		if (exists.length === 0) {
			return Response.json({ error: "Invalid threadId" }, { status: 403 });
		}
	}

	if (!question) {
		return new Response("Question not provided", { status: 400 });
	}

	const questionEmbeddings = await embeddings.embedQuery(question);

	// This approach (using index) isn't perfect if you want to search only in some specific documents. the index returns 3 best match document chunks. But those document chunks could be those the user doesn't want to search in.
	// The alternative solution is to first filter the documents and then do a vector search on the filtered documents.This solution is more precise but slower as index cannot be used. Read more: https://turso.tech/blog/filtering-in-vector-search-with-metadata-and-rag-pipelines
	let documentsChunks = await db
		.select({
			id: sql<number>`documents_chunk.id`,
			content: sql<string>`content`,
			metadata: sql<string>`metadata`,
			userDocumentId: sql<number>`userDocumentId`,
		})
		.from(
			sql`vector_top_k('vector_index', vector32(${JSON.stringify(questionEmbeddings)}), 3)`,
		)
		.leftJoin(
			documentsChunkTable,
			sql`${documentsChunkTable}.id = vector_top_k.id`,
		);

	// If there are no documents, throw an error.
	if (documentsChunks.length === 0) {
		return Response.json({ error: "No sources found" }, { status: 400 });
	}

	documentsChunks = documentsChunks.filter((c) =>
		selectedDocumentIds.includes(c.userDocumentId),
	);

	if (!threadId) {
		const query = await db
			.insert(messageThreadTable)
			.values({
				name: question,
				userId: userId,
			})
			.returning({
				id: messageThreadTable.id,
			});
		threadId = query[0].id;
	}

	// add this user asked message to database.
	await db.insert(usersMessagesTable).values({
		userId: userId,
		content: question,
		role: "user",
		createdAt: new Date().toISOString(),
		threadId: threadId,
	});

	// fetch all user messages.
	const usersMessages = await db
		.select({
			role: usersMessagesTable.role,
			content: usersMessagesTable.content,
		})
		.from(usersMessagesTable)
		.where(eq(usersMessagesTable.threadId, threadId))
		.orderBy(usersMessagesTable.createdAt);

	// change the last message by also adding sources.
	const lastMessage = usersMessages[usersMessages.length - 1];
	const sources = documentsChunks.map((chunk) => chunk.content).join("\n");
	lastMessage.content = `${question}\n Sources: ${sources}`;

	// build messages array to supply to llm. add system Message as the first message
	const messages = [systemMessage, ...usersMessages.slice(0, -1), lastMessage];

	const response = await chatModel.invoke(messages);

	// add response and sources to messages table
	const query = await db
		.insert(usersMessagesTable)
		.values({
			userId: userId,
			role: "assistant",
			content: response.content as string,
			createdAt: new Date().toISOString(),
			threadId: threadId,
		})
		.returning();

	const message = query[0];

	// add sources to database.
	if (documentsChunks.length > 0) {
		await db.insert(messageSourcesTable).values(
			documentsChunks.map((chunk) => ({
				messageId: message.id,
				documentChunkId: chunk.id as number,
			})),
		);
	}

	const result = {
		id: message.id,
		content: message.content,
		role: message.role,
		createdAt: message.createdAt,
		threadId: threadId,
		sources: documentsChunks.map((chunk) => {
			const metadata = JSON.parse(chunk.metadata ?? "{}");
			return {
				name: metadata.name,
				linesFrom: metadata.loc?.lines?.from,
				linesTo: metadata.loc?.lines?.to,
				userDocumentId: chunk.userDocumentId,
			};
		}),
	};

	return Response.json({ result });
}
