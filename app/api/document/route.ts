import { documentsChunkTable, userDocumentsTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import axios from "axios";
import { Document } from "@langchain/core/documents";
import cloudinary from "cloudinary";
import { embeddings, splitDocument } from "../utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

cloudinary.v2.config({
	secure: true,
});

export async function GET(request: Request) {
	const documents = await db.select().from(userDocumentsTable);
	return Response.json({ result: documents });
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user.id;

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file") as File | null;

	if (!file) {
		return Response.json({ error: "File not found" }, { status: 400 });
	}

	// 1. Get buffer from file
	const bytes = await file.arrayBuffer();
	const buffer = Buffer.from(bytes);

	let uploadResult: cloudinary.UploadApiResponse | undefined;

	try {
		uploadResult = await new Promise((resolve) => {
			cloudinary.v2.uploader
				.upload_stream({ resource_type: "raw" }, (error, result) => {
					return resolve(result);
				})
				.end(buffer);
		});

		if (!uploadResult) {
			throw new Error();
		}
	} catch (error) {
		return Response.json({ error: "Something went wrong" }, { status: 400 });
	}

	const fileContents = await file.text();
	const document = new Document({
		metadata: { name: file.name },
		pageContent: fileContents,
	});

	const documents = await splitDocument(document);

	// take vector for each of these documents.
	const documentEmbeddings = await embeddings.embedDocuments(
		documents.map((doc) => doc.pageContent),
	);

	// insert users uploaded document information
	const userDocuments = await db
		.insert(userDocumentsTable)
		.values({
			name: file.name,
			url: uploadResult.secure_url,
			userId,
		})
		.returning();

	// insert document chunks.
	const documentChunks: (typeof documentsChunkTable.$inferInsert)[] =
		documents.map((doc, index) => ({
			metadata: JSON.stringify(doc.metadata),
			content: doc.pageContent,
			userDocumentId: userDocuments[0].id,
			vector: documentEmbeddings[index],
		}));
	await db.insert(documentsChunkTable).values(documentChunks);

	return Response.json({ result: "ok" });
}

export async function DELETE(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user.id;

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const documentId = body.documentId;

	await db
		.delete(userDocumentsTable)
		.where(eq(userDocumentsTable.id, documentId));

	return Response.json({ result: "ok" });
}
