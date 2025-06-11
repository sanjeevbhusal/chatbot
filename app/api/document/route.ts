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
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
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

	const body = await request.json();
	const publicUrl = body.publicUrl;
	const fileName = body.fileName;

	const response = await axios.get(publicUrl);
	const fileContents = response.data;

	const document = new Document({
		metadata: { name: fileName },
		pageContent: fileContents,
	});

	const documents = await splitDocument(document);

	// take vector for each of these document.
	const documentEmbeddings = await embeddings.embedDocuments(
		documents.map((doc) => doc.pageContent),
	);

	// insert users uploaded document information
	const userDocuments = await db
		.insert(userDocumentsTable)
		.values({
			name: fileName,
			url: publicUrl,
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

	// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
	return Response.json({ uploadedBy: 1 });
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
