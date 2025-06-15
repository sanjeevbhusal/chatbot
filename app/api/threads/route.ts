import { messageThreadTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user.id;

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const threads = await db
		.select({ id: messageThreadTable.id, name: messageThreadTable.name })
		.from(messageThreadTable)
		.where(eq(messageThreadTable.userId, userId))
		.orderBy(desc(messageThreadTable.createdAt));

	return Response.json({ result: threads });
}

export async function PUT(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user.id;

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const { name, threadId } = body;

	await db
		.update(messageThreadTable)
		.set({ name })
		.where(eq(messageThreadTable.id, threadId));

	return Response.json({ result: "ok" });
}

export const DELETE = async (request: Request) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user.id;

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const threadId = body.threadId;

	await db
		.delete(messageThreadTable)
		.where(
			and(
				eq(messageThreadTable.id, threadId),
				eq(messageThreadTable.userId, userId),
			),
		);

	return Response.json({ result: "ok" });
};
