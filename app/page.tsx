"use client";

import { authClient } from "@/lib/auth-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthCheck() {
	const router = useRouter();

	const { data, isPending } = authClient.useSession();

	console.log(data, isPending);

	if (isPending) {
		return (
			<div className="h-screen w-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<p className="font-bold text-xl">Checking Authentication...</p>
					<LoaderCircle className="animate-spin" />
				</div>
			</div>
		);
	}

	router.push("/chat");
}
