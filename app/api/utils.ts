import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { readFileSync } from "node:fs";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { LibSQLVectorStore } from "@langchain/community/vectorstores/libsql";
import "dotenv/config";

import { createClient } from "@libsql/client";

if (!process.env.TURSO_DATABASE_URL) {
	throw new Error("Database URL not set");
}

export const dbClient = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
});

export const embeddings = new OpenAIEmbeddings({
	model: "text-embedding-3-small",
	openAIApiKey: process.env.OPENAI_API_KEY,
});

// embeddings.embedDocuments();

export const vectorStore = new LibSQLVectorStore(embeddings, {
	db: dbClient,
	table: "documents_chunk",
	column: "vector",
});

export const chatModel = new ChatOpenAI({
	model: "gpt-3.5-turbo",
	openAIApiKey: process.env.OPENAI_API_KEY,
});

export const loadDocument = (filePath: string) => {
	const documentContent = readFileSync(filePath, "utf-8");
	return new Document({ pageContent: documentContent });
};

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});

export const splitDocument = async (document: Document) => {
	return await splitter.splitDocuments([document]);
};

export const create_embeddings = async (filePath: string) => {
	const document = loadDocument(filePath);
	const documents = await splitDocument(document);
	await vectorStore.addDocuments(documents);
};

const message_history: { role: string; content: string }[] = [];
const system_message = {
	role: "system",
	content:
		"You are an assistant for question-answering tasks. Use the context provided to answer each question. If you don't know the answer, say that you don't know. Use three sentences maximum and keep the answer concise.",
};
message_history.push(system_message);

export const find_documents = async (query: string) => {
	const retrieved_docs = await vectorStore.similaritySearch(query, 2);
	const serialized = retrieved_docs.map(
		(doc) => `Source: ${doc.metadata}\nContent: ${doc.pageContent}`,
	);
	return serialized;
};

export const getAnswer = async (question: string) => {
	const sources = await find_documents(question);
	const userMessage = {
		role: "user",
		content: `${question}\n Sources: ${sources}`,
	};
	message_history.push(userMessage);
	const response = await chatModel.invoke(message_history);
	message_history.push({
		role: "assistant",
		content: response.content,
	});
	if (typeof response.content === "string") {
		return response.content;
	}
	return "";
};
