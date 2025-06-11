"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client"; //import the auth client

export default function SignIn() {
	const signin = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
		});
	};
	return <Button onClick={signin}>Sign In with Google</Button>;
}
