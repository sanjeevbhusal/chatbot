import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { environmentVariables } from "@/lib/env";

export const embeddings = new OpenAIEmbeddings({
	model: "text-embedding-3-small",
	openAIApiKey: environmentVariables.OPENAI_API_KEY,
});

export const chatModel = new ChatOpenAI({
	model: environmentVariables.OPENAI_MODEL,
	openAIApiKey: environmentVariables.OPENAI_API_KEY,
});

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});

export const splitDocument = async (document: Document) => {
	return await splitter.splitDocuments([document]);
};
