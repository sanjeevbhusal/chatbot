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
import { UploadButton } from "@/lib/uploadThing";
import { CircleHelp, Plus } from "lucide-react";
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

			<UploadButton
				endpoint="documentsUploader"
				onClientUploadComplete={(res) => {
					// Do something with the response
					alert("Upload Completed");
				}}
				onUploadError={(error: Error) => {
					// Do something with the error.
					alert(`ERROR! ${error.message}`);
				}}
				content={{
					button: (
						<p className="flex items-center gap-2">
							<Plus /> Add Document
						</p>
					),
				}}
				className="p-4 w-full ut-allowed-content:hidden ut-button:w-full"
			/>

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
		</div>
	);
}
