import type { NextRequest } from "next/server";
import { getAnswer } from "../utils";

export async function GET(request: NextRequest) {
	const question = request.nextUrl.searchParams.get("question");
	if (!question) {
		return new Response("Question not provided", { status: 400 });
	}
	const answer = await getAnswer(question);
	return Response.json({ answer });
}
