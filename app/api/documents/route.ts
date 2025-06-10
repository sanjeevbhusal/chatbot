import type { NextRequest } from "next/server";
import { create_embeddings } from "../utils";
import path from "node:path";

export async function POST(request: NextRequest) {
	const filePath = path.join(process.cwd(), "app/api/documents/document.txt");
	if (!filePath) {
		return new Response("File path not provided", { status: 400 });
	}
	await create_embeddings(filePath);
	return new Response("Embeddings created successfully");
}
