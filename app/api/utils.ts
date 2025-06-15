import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import "dotenv/config";

export const embeddings = new OpenAIEmbeddings({
	model: "text-embedding-3-small",
	openAIApiKey: process.env.OPENAI_API_KEY,
});

export const chatModel = new ChatOpenAI({
	model: process.env.OPENAI_MODEL,
	openAIApiKey: process.env.OPENAI_API_KEY,
});

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});

export const splitDocument = async (document: Document) => {
	return await splitter.splitDocuments([document]);
};
