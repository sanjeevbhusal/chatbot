"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
	const signin = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "/chat",
		});
	};
	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<Button onClick={signin}>Sign In with Google</Button>
		</div>
	);
}
