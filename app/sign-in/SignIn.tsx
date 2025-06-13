"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GoogleIcon from "./google-icon.svg";

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
		<div className="h-screen w-screen flex">
			<div className="basis-10 grow shrink-0 relative">
				<Image
					src="/login-page.png"
					alt="logo"
					fill
					className="h-full w-full object-cover"
				/>
			</div>
			<div className="basis-10 grow shrink-0 flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold">Welcome to Ask My Docs</h1>
				<span className="text-gray-500 mt-2">
					Log In to your account to get started
				</span>
				<Button
					onClick={signin}
					className="cursor-pointer mt-4"
					variant="outline"
				>
					<Image src={GoogleIcon} alt="google-icon" className="h-6 w-6" />
					<span>Log In with Google</span>
				</Button>
			</div>
		</div>
	);
}
