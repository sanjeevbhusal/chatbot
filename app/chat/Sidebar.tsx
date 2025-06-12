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
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {} from "@/components/ui/form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetDocumentsQuery } from "@/lib/queries";
import type { Document, Thread } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CircleHelp,
	EllipsisVertical,
	Eye,
	Loader2,
	Pen,
	Plus,
	Trash2,
} from "lucide-react";
import { CldUploadButton } from "next-cloudinary";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface SidebarProps {
	setActiveDocument: (document?: Document) => void;
	setActiveThread: (thread: Thread) => void;
	threads: Thread[];
}

export default function Sidebar({
	setActiveDocument,
	setActiveThread,
	threads,
}: SidebarProps) {
	const [selectedDocumentForDeletion, setSelectedDocumentForDeletion] =
		useState<Document | undefined>(undefined);
	const [selectedThreadForRenaming, setSelectedThreadForRenaming] = useState<
		Thread | undefined
	>(undefined);

	const queryClient = useQueryClient();

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

	const createThreadMutation = useMutation({
		mutationFn: async () => {
			await fetch("/api/threads", {
				method: "POST",
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["threads"],
			});
		},
	});

	const renameThreadMutation = useMutation({
		mutationFn: async (name: string) => {
			await fetch("/api/threads", {
				method: "PUT",
				body: JSON.stringify({ name, threadId: selectedThreadForRenaming?.id }),
				headers: {
					"Content-Type": "application/json",
				},
			});
		},
		onSuccess: () => {
			setSelectedThreadForRenaming(undefined);
			queryClient.invalidateQueries({
				queryKey: ["threads"],
			});
		},
	});

	const formSchema = z.object({
		name: z.string().min(1).max(50),
	});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: selectedThreadForRenaming?.name,
		},
	});

	useEffect(() => {
		if (selectedThreadForRenaming) {
			form.clearErrors();
			form.setValue("name", selectedThreadForRenaming.name);
		}
	}, [selectedThreadForRenaming, form]);

	function onSubmit(values: z.infer<typeof formSchema>) {
		renameThreadMutation.mutate(values.name);
	}

	return (
		<div className="h-full flex flex-col gap-8">
			<div className="basis-[calc(50%-32px)] shrink-0 grow-0 flex flex-col gap-0">
				<div className="basis-[44px] shrink-0">
					<div className="flex justify-between items-center  px-4 py-2">
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
						<Button
							asChild
							className="w-fit cursor-pointer"
							size="sm"
							variant="outline"
						>
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
					<Separator />
				</div>

				<div className="basis-[44px] grow overflow-scroll">
					{documents.length === 0 ? (
						<p className="p-4 text-slate-600">No Sources Uploaded</p>
					) : (
						<div className="flex flex-col gap-4 p-4">
							{documents.map((document) => (
								<div className="flex gap-4 items-center" key={document.id}>
									<div
										className={cn(
											buttonVariants({
												variant: "secondary",
												size: "sm",
												className: "w-full justify-between cursor-pointer",
											}),
										)}
										onClick={() => setActiveDocument(document)}
										onKeyUp={(e) => {
											if (e.key === "Enter") {
												setActiveDocument(document);
											}
										}}
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
									</div>
								</div>
							))}
						</div>
					)}
				</div>

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

			<div className="basis-[calc(50%-32px)] shrink-0 grow-0 flex flex-col gap-0">
				<div className="basis-[44px] shrink-0">
					<div className="flex justify-between gap-2 px-4 py-2">
						<span className="font-semibold  text-xl">Threads </span>
						<Button
							className="w-fit cursor-pointer"
							size="sm"
							variant="outline"
							onClick={() => createThreadMutation.mutate()}
						>
							<Plus /> New
						</Button>{" "}
					</div>
					<Separator />
				</div>

				<div className="p-4 basis-[44px] grow overflow-scroll">
					<div className="flex flex-col gap-4 ">
						{threads.map((thread) => (
							<div
								key={thread.id}
								className={cn(
									buttonVariants({
										variant: "secondary",
										size: "sm",
										className: "w-full justify-between cursor-pointer",
									}),
								)}
								onClick={() => setActiveThread(thread)}
								onKeyUp={(e) => {
									if (e.key === "Enter") {
										setActiveThread(thread);
									}
								}}
							>
								<p className="font-semibold">{thread.name}</p>
								<DropdownMenu>
									<DropdownMenuTrigger className="cursor-pointer">
										<EllipsisVertical />
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem
											variant="destructive"
											onClick={(e) => {
												e.stopPropagation();
												// deleteDocumentMutation.mutate(document.id);
											}}
										>
											<Trash2 />
											Delete
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												setSelectedThreadForRenaming(thread);
											}}
										>
											<Pen />
											Rename
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						))}
					</div>
					<Dialog
						open={!!selectedThreadForRenaming}
						onOpenChange={() => setSelectedThreadForRenaming(undefined)}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									Rename {selectedThreadForRenaming?.name}
								</DialogTitle>
							</DialogHeader>
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-8"
								>
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input
														// defaultValue={selectedThreadForRenaming?.name}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="outline">Cancel</Button>
										</DialogClose>
										<Button type="submit">
											Save changes
											{renameThreadMutation.isPending && (
												<Loader2 className="animate-spin" />
											)}
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
