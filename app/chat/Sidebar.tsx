import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useGetDocumentsQuery } from "@/lib/queries";
import type { Document } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleHelp, EllipsisVertical, Eye, Plus, Trash2 } from "lucide-react";
import { CldUploadButton } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
	setActiveDocument: (document?: Document) => void;
}

export default function Sidebar({ setActiveDocument }: SidebarProps) {
	const [selectedDocumentForDeletion, setSelectedDocumentForDeletion] =
		useState<Document | undefined>(undefined);

	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();

	const documentsQuery = useGetDocumentsQuery();
	const documents = documentsQuery.data ?? [];

	const deleteDocumentMutation = useMutation({
		mutationFn: async (documentId: number) => {
			const response = await fetch("/api/document", {
				method: "DELETE",
				body: JSON.stringify({ documentId }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			return data.result;
		},
		onSuccess: () => {
			setSelectedDocumentForDeletion(undefined);
			queryClient.invalidateQueries({
				queryKey: ["documents"],
			});
		},
	});

	const uploadDocumentMutation = useMutation({
		mutationFn: async ({
			publicUrl,
			fileName,
		}: { publicUrl: string; fileName: string }) => {
			const response = await fetch("/api/document", {
				method: "POST",
				body: JSON.stringify({ publicUrl, fileName }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			return data.result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["documents"],
			});
		},
	});

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
							const info = r.info as Record<string, string>;
							const publicUrl = info.secure_url;
							const fileName = info.original_filename;
							uploadDocumentMutation.mutate({ publicUrl, fileName });
						}}
						signatureEndpoint="/api/document/upload-signature"
					>
						<Plus /> Upload
					</CldUploadButton>
				</Button>
			</div>

			{documents.length === 0 ? (
				<p className="p-4 text-slate-600">No Sources Uploaded</p>
			) : (
				<div className="flex flex-col gap-2 p-4">
					{documents.map((document) => (
						<div className="flex gap-4 items-center" key={document.id}>
							<Button
								variant="outline"
								className="text-blue-500 w-full justify-between"
								onClick={() => setActiveDocument(document)}
							>
								<p className="font-semibold">{document.name}</p>
								<DropdownMenu>
									<DropdownMenuTrigger className="cursor-pointer">
										<EllipsisVertical />
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												setActiveDocument(document);
											}}
										>
											<Eye />
											View
										</DropdownMenuItem>
										<DropdownMenuItem
											variant="destructive"
											onClick={(e) => {
												e.stopPropagation();
												deleteDocumentMutation.mutate(document.id);
											}}
										>
											<Trash2 />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</Button>
						</div>
					))}
				</div>
			)}

			<AlertDialog
				open={!!selectedDocumentForDeletion}
				onOpenChange={() => setSelectedDocumentForDeletion(undefined)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {selectedDocumentForDeletion?.name}
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you absolutely sure? This action cannot be undone
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={async (e) => {
								e.stopPropagation();
								await fetch("/api/document", {
									method: "DELETE",
									body: JSON.stringify({
										documentId: selectedDocumentForDeletion?.id,
									}),
								});
								setSelectedDocumentForDeletion(undefined);
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
