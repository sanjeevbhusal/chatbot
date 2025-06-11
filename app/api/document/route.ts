import { userDocumentsTable } from "@/drizzle/schema";
import { db } from "@/lib/db";

export async function GET(request: Request) {
	const documents = await db.select().from(userDocumentsTable);
	return Response.json({ result: documents });
}
