import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
	return (
		<div className="h-screen w-screen">
			<nav className="fixed left-0 right-0">
				<div className="px-6 py-4 flex items-center justify-between">
					<div className="h-12 w-40 relative">
						<Image src="/logo.png" alt="logo" fill />
					</div>
					<Button variant="outline" className="cursor-pointer" asChild>
						<Link href="/sign-in">Sign In</Link>
					</Button>
				</div>
				<Separator />
			</nav>
			<main className="h-full flex flex-col gap-6 items-center justify-center">
				<h1 className="text-6xl font-bold w-[800px] text-center">
					{" "}
					Ask questions against your documents.
				</h1>
				<p className="text-gray-600 text-xl w-[600px] text-center">
					Get answer to all your queries without having to read the document
					every time. The answer even includes the document sources.
				</p>
				<Button className="cursor-pointer" asChild>
					<Link href="/sign-in">Get Started Now</Link>
				</Button>
			</main>
		</div>
	);
}
