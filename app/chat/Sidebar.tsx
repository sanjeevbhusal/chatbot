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
	DropdownMenuSubTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDocumentsQuery } from "@/lib/queries";
import { type Document, Message, type Thread } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import {
	Ellipsis,
	EllipsisVertical,
	Eye,
	Loader2,
	Pen,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import UploadFileModal from "./UploadFileModal";

interface SidebarProps {
	setActiveDocument: (document?: Document) => void;
	setActiveThread: (thread?: Thread) => void;
	threads: Thread[];
	activeThread?: Thread;
	setActiveThreadToSet: (threadId?: number) => void;
}

/**
 * The sidebar component for the chat application.
 *
 * This component displays a list of threads and sources on the left side of the
 * screen. It allows the user to select a thread or source, and to create a new
 * thread or source.
 *
 * @param {function} setActiveDocument - A function to call when the user selects a new document.
 * @param {function} setActiveThread - A function to call when the user selects a new thread.
 * @param {Thread[]} threads - An array of threads.
 * @param {Thread|undefined} activeThread - The currently active thread.
 * @param {function} setActiveThreadToSet - A function to call when the user wants to set a new thread.
 */
export default function Sidebar({
	setActiveDocument,
	setActiveThread,
	threads,
	activeThread,
	setActiveThreadToSet,
}: SidebarProps) {
	const [selectedDocumentForDeletion, setSelectedDocumentForDeletion] =
		useState<Document | undefined>(undefined);
	const [selectedThreadForRenaming, setSelectedThreadForRenaming] = useState<
		Thread | undefined
	>(undefined);
	const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);

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

	const deleteThreadMutation = useMutation({
		mutationFn: async (threadId: number) => {
			await fetch("/api/threads", {
				method: "DELETE",
				body: JSON.stringify({ threadId }),
				headers: {
					"Content-Type": "application/json",
				},
			});
		},
		onSuccess: (_, threadId) => {
			const index = threads.map((thread) => thread.id).indexOf(threadId);
			const nextIndex = index + 1;

			queryClient.invalidateQueries({
				queryKey: ["threads"],
			});

			// move to next thread
			if (threads[nextIndex]) {
				setActiveThreadToSet(threads[nextIndex].id);
			} else {
				setActiveThread(undefined);
			}
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
		<div className="h-full flex flex-col gap-4">
			<div className="basis-[50px] grow-0 shrink-0">
				<div className="px-2 pt-2">
					<Button
						className="cursor-pointer w-full justify-start"
						size="sm"
						variant="ghost"
						// onClick={() => createThreadMutation.mutate()}
						onClick={() => setActiveThread(undefined)}
					>
						<Plus /> New Chat
					</Button>
				</div>

				<div className="px-2 pt-2">
					<Button
						className="cursor-pointer w-full justify-start"
						size="sm"
						variant="ghost"
						onClick={() => setIsUploadFileModalOpen(true)}
					>
						<Plus /> New Source
					</Button>
				</div>
			</div>

			<Tabs
				defaultValue="chats"
				className="px-4 basis-[50px] grow overflow-hidden flex flex-col"
			>
				<TabsList className="w-full basis-[36px] grow-0 shrink-0">
					<TabsTrigger value="chats">Chats</TabsTrigger>
					<TabsTrigger value="sources">Sources</TabsTrigger>
				</TabsList>

				<TabsContent
					value="chats"
					className="pt-2 pb-4 basis-[36px] overflow-scroll grow"
				>
					<div className="flex flex-col">
						{threads.length > 0 ? (
							threads.map((thread) => (
								<div
									key={thread.id}
									className={cn(
										buttonVariants({
											variant: "ghost",
											className: clsx(
												"w-full justify-between cursor-pointer px-2 group",
												{
													"bg-[#d1d2d1] hover:bg-[#d1d2d1]":
														activeThread?.id === thread.id,
												},
											),
										}),
									)}
									onClick={() => setActiveThread(thread)}
									onKeyUp={(e) => {
										if (e.key === "Enter") {
											setActiveThread(thread);
										}
									}}
								>
									<p>{thread.name}</p>
									<DropdownMenu
										onOpenChange={(open) => {
											if (open) {
												setActiveThread(thread);
											}
										}}
									>
										<DropdownMenuTrigger className="cursor-pointer opacity-0 group-hover:opacity-100">
											<Ellipsis />
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem
												variant="destructive"
												onClick={(e) => {
													e.stopPropagation();
													deleteThreadMutation.mutate(thread.id);
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
							))
						) : (
							<p className=" text-slate-600">No Chats Created</p>
						)}
					</div>
				</TabsContent>

				<TabsContent value="sources" className="pt-2 ">
					<div className="basis-[36px] overflow-scroll grow">
						{documents.length === 0 ? (
							<p className=" text-slate-600">No Sources Uploaded</p>
						) : (
							<div className="flex flex-col gap-4">
								{documents.map((document) => (
									<div className="flex gap-4 items-center" key={document.id}>
										<div
											className={cn(
												buttonVariants({
													variant: "ghost",
													className: clsx(
														"w-full justify-between cursor-pointer px-2",
													),
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
				</TabsContent>
			</Tabs>

			<Dialog
				open={!!selectedThreadForRenaming}
				onOpenChange={() => setSelectedThreadForRenaming(undefined)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename {selectedThreadForRenaming?.name}</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

			<UploadFileModal
				open={isUploadFileModalOpen}
				onOpenChange={(open) => setIsUploadFileModalOpen(open)}
			/>
		</div>
	);
}
