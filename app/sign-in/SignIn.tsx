"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function SignIn() {
	const router = useRouter();

	const createThreadMutation = useMutation({
		mutationFn: async () => {
			await fetch("/api/threads", {
				method: "POST",
			});
		},
		onSuccess: () => {
			router.push("/chat");
		},
	});

	const signin = async () => {
		await authClient.signIn.social({
			provider: "google",
		});
		createThreadMutation.mutate();
	};

	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<Button onClick={signin} className="cursor-pointer">
				Sign In with Google
			</Button>
		</div>
	);
}
