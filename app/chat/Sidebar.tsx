import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import type { Document } from "@/lib/types";
import { CircleHelp } from "lucide-react";
import { CldUploadButton } from "next-cloudinary";
import { useRouter } from "next/navigation";

interface SidebarProps {
	documents: Document[];
	setActiveDocument: (document?: Document) => void;
}

export default function Sidebar({
	documents,
	setActiveDocument,
}: SidebarProps) {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const uploadDocument = async (publicUrl: string, fileName: string) => {
		const response = await fetch("/api/document", {
			method: "POST",
			body: JSON.stringify({ publicUrl, fileName }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		const data = await response.json();
	};

	return (
		<div>
			<div className="flex justify-between gap-2 px-4 py-2">
				<div className="flex items-center gap-2 font-semibold text-xl">
					<span>Sources </span>
					<Tooltip>
						<TooltipTrigger>
							<CircleHelp />
						</TooltipTrigger>
						<TooltipContent>
							The AI Model will answer your questions from the documents
							uploaded.
						</TooltipContent>
					</Tooltip>{" "}
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild className="w-fit ml-auto">
						<Avatar>
							<AvatarImage
								src={session?.user.image ?? ""}
								className="h-8 w-8 rounded-full"
								alt={session?.user.name ?? ""}
							/>
							<AvatarFallback>{session?.user.name}</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="top">
						<DropdownMenuItem
							onClick={async () => {
								await authClient.signOut({
									fetchOptions: {
										onSuccess: () => router.push("/sign-in"),
									},
								});
							}}
						>
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<Separator />

			<div className="p-4">
				<Button asChild className="w-full">
					<CldUploadButton
						onSuccess={(r) => {
							console.log(r);
							const info = r.info as Record<string, string>;
							const publicUrl = info.secure_url;
							const fileName = info.original_filename;
							uploadDocument(publicUrl, fileName);
						}}
						signatureEndpoint="/api/document/upload-signature"
					/>
				</Button>
			</div>

			{documents.length === 0 ? (
				<p className="p-4 text-slate-600">No Documents Uploaded</p>
			) : (
				<div className="flex flex-col gap-2 p-4">
					{documents.map((document) => (
						<div className="flex gap-4 items-center" key={document.id}>
							<p className="font-semibold">{document.name}</p>
							<Button
								variant="link"
								className="text-blue-500 p-0 h-fit"
								onClick={() => setActiveDocument(document)}
							>
								View
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
