import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { dbClient, embeddings, splitDocument } from "../utils";
import { db } from "@/lib/db";
import { documentsChunkTable, userDocumentsTable } from "@/drizzle/schema";
import axios from "axios";
import { Document } from "@langchain/core/documents";
const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// Define as many FileRoutes as you like, each with a unique routeSlug
	documentsUploader: f({
		text: {
			/**
			 * For full list of options and defaults, see the File Route API reference
			 * @see https://docs.uploadthing.com/file-routes#route-config
			 */
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		// Set permissions and file types for this FileRoute
		.middleware(async ({ req }) => {
			// This code runs on your server before upload
			// const user = await auth(req);

			// const formData = await req.formData();

			// If you throw, the user will not be able to upload
			// if (!user) throw new UploadThingError("Unauthorized");

			// Whatever is returned here is accessible in onUploadComplete as `metadata`
			return { userId: 1 };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload

			// await db.insert(userDocumentsTable).values({
			// 	name: file.name,
			// 	url: file.ufsUrl,
			// 	userId: 1,
			// });

			// await splitDocument(file.)

			// dbClient.execute("INSERT INTO documents (url) VALUES (?)", [file.ufsUrl]);

			const response = await axios.get(file.ufsUrl);
			const fileContents = response.data;

			const document = new Document({
				metadata: { name: file.name },
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
					name: file.name,
					url: file.ufsUrl,
					userId: metadata.userId,
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
			return { uploadedBy: metadata.userId };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
