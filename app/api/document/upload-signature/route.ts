import cloudinary from "cloudinary";

export async function POST(request: Request) {
	const params = await request.json();
	const response = cloudinary.v2.utils.api_sign_request(
		params.paramsToSign,
		process.env.CLOUDINARY_API_SECRET ?? "",
	);
	return Response.json({ signature: response });
}
