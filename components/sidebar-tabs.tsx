"use client";

import { useGetDocumentsQuery } from "@/lib/queries";
import type { Document, Thread } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircleIcon,
	Ellipsis,
	EllipsisVertical,
	Eye,
	File,
	Loader2,
	MessageCircle,
	Pen,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Alert, AlertTitle } from "./ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import {
	SidebarContent,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "./ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface SidebarTabsProps {
	activeThreadId?: number;
	setActiveThreadId: (threadId: number | null) => void;
	setActiveDocument: (document?: Document) => void;
	selectedDocumentIds: number[];
	setSelectedDocumentIds: (documentIds: number[]) => void;
}

export default function SidebarTabs({
	setActiveDocument,
	setActiveThreadId,
	activeThreadId,
	selectedDocumentIds,
	setSelectedDocumentIds,
}: SidebarTabsProps) {
	const [selectedThreadForRenaming, setSelectedThreadForRenaming] = useState<
		Thread | undefined
	>(undefined);
	const [selectedThreadForDeletion, setSelectedThreadForDeletion] = useState<
		Thread | undefined
	>(undefined);
	const [selectedDocumentForDeletion, setSelectedDocumentForDeletion] =
		useState<Document | undefined>(undefined);
	const sidebarState = useSidebar();

	const formSchema = z.object({
		name: z.string().min(1).max(50),
	});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: selectedThreadForRenaming?.name,
		},
	});

	const useGetThreadsQuery = useQuery({
		queryKey: ["threads"],
		queryFn: async () => {
			const response = await fetch("/api/threads");
			const data = await response.json();
			return data.result as Thread[];
		},
	});
	const documentsQuery = useGetDocumentsQuery();
	const queryClient = useQueryClient();

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
			setSelectedThreadForDeletion(undefined);

			const index = threads.map((thread) => thread.id).indexOf(threadId);
			const nextIndex = index + 1;

			queryClient.invalidateQueries({
				queryKey: ["threads"],
			});

			// move to next thread
			if (threads[nextIndex]) {
				setActiveThreadId(threads[nextIndex].id);
			} else {
				setActiveThreadId(null);
			}
		},
	});

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

	useEffect(() => {
		if (selectedThreadForRenaming) {
			form.clearErrors();
			form.setValue("name", selectedThreadForRenaming.name);
		}
	}, [selectedThreadForRenaming, form]);

	useEffect(() => {
		if (documentsQuery.data) {
			setSelectedDocumentIds(documentsQuery.data.map((d) => d.id));
		}
	}, [documentsQuery.data, setSelectedDocumentIds]);

	const documents = documentsQuery.data ?? [];
	const threads = useGetThreadsQuery?.data ?? [];

	return (
		<>
			<Tabs defaultValue="documents" className="flex min-h-0 flex-1">
				<SidebarGroup>
					<TabsList className="w-full" hidden={!sidebarState.open}>
						<TabsTrigger value="documents">Documents</TabsTrigger>
						<TabsTrigger value="chats">Chats</TabsTrigger>
					</TabsList>
				</SidebarGroup>

				<SidebarContent>
					<SidebarGroup>
						<TabsContent value="chats" className="flex flex-col gap-2">
							<SidebarMenu>
								{threads.length > 0 ? (
									threads.map((thread) => (
										<SidebarMenuItem
											key={thread.id}
											onClick={() => {
												setActiveThreadId(thread.id);
											}}
										>
											<SidebarMenuButton
												className="cursor-pointer"
												isActive={thread.id === activeThreadId}
											>
												<MessageCircle />
												<span>{thread.name}</span>
											</SidebarMenuButton>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<SidebarMenuAction showOnHover>
														<Ellipsis />
													</SidebarMenuAction>
												</DropdownMenuTrigger>
												<DropdownMenuContent side="right" align="start">
													<DropdownMenuItem
														variant="destructive"
														onClick={(e) => {
															e.stopPropagation();
															setSelectedThreadForDeletion(thread);
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
										</SidebarMenuItem>
									))
								) : (
									<p className="px-2 text-slate-600">No Chats Created</p>
								)}
							</SidebarMenu>
						</TabsContent>

						<TabsContent value="documents" className="flex flex-col gap-2">
							<SidebarGroupLabel>Select all documents</SidebarGroupLabel>
							<SidebarGroupAction asChild>
								<Input
									type="checkbox"
									className="p-0 h-4 w-4 cursor-pointer top-[1rem]"
									checked={
										!documentsQuery.isPending &&
										selectedDocumentIds.length === documents.length
									}
									onChange={() => {
										if (selectedDocumentIds.length === documents.length) {
											setSelectedDocumentIds([]);
										} else {
											setSelectedDocumentIds(documents.map((d) => d.id));
										}
									}}
								/>
							</SidebarGroupAction>
							{!documentsQuery.isPending &&
								selectedDocumentIds.length === 0 && (
									<Alert variant="destructive">
										<AlertCircleIcon />
										<AlertTitle>No Documents Selected</AlertTitle>
									</Alert>
								)}

							<SidebarMenu>
								{documents.length === 0 ? (
									<p className=" text-slate-600">No Sources Uploaded</p>
								) : (
									documents.map((document) => (
										<SidebarMenuItem
											key={document.id}
											onClick={() => setActiveDocument(document)}
										>
											<Tooltip>
												<TooltipTrigger asChild>
													<SidebarMenuButton className="cursor-pointer">
														<File />
														<span>{document.name}</span>
													</SidebarMenuButton>
												</TooltipTrigger>
												<TooltipContent hidden={sidebarState.open} side="right">
													<span>{document.name}</span>
												</TooltipContent>
											</Tooltip>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<SidebarMenuAction
														showOnHover
														className="right-[40px]"
													>
														<EllipsisVertical />
													</SidebarMenuAction>
												</DropdownMenuTrigger>
												<DropdownMenuContent side="right" align="start">
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
															setSelectedDocumentForDeletion(document);
														}}
													>
														<Trash2 />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>

											<SidebarMenuAction
												asChild
												onClick={(e) => {
													e.stopPropagation();
												}}
											>
												<Input
													type="checkbox"
													className="p-0 h-4 w-4 cursor-pointer"
													checked={selectedDocumentIds.includes(document.id)}
													onChange={() => {
														if (selectedDocumentIds.includes(document.id)) {
															setSelectedDocumentIds(
																selectedDocumentIds.filter(
																	(id) => id !== document.id,
																),
															);
														} else {
															setSelectedDocumentIds([
																...selectedDocumentIds,
																document.id,
															]);
														}
													}}
												/>
											</SidebarMenuAction>
										</SidebarMenuItem>
									))
								)}
							</SidebarMenu>
						</TabsContent>
					</SidebarGroup>
				</SidebarContent>
			</Tabs>

			<Dialog
				open={!!selectedThreadForRenaming}
				onOpenChange={() => setSelectedThreadForRenaming(undefined)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Chat</DialogTitle>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((values) =>
								renameThreadMutation.mutate(values.name),
							)}
							className="space-y-8"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input placeholder="Rename chat name" {...field} />
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
							onClick={(e) => {
								e.stopPropagation();
								if (selectedDocumentForDeletion) {
									deleteDocumentMutation.mutate(selectedDocumentForDeletion.id);
								}
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={!!selectedThreadForDeletion}
				onOpenChange={() => setSelectedThreadForDeletion(undefined)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {selectedThreadForDeletion?.name}
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you absolutely sure? This action cannot be undone
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.stopPropagation();
								if (selectedThreadForDeletion) {
									deleteThreadMutation.mutate(selectedThreadForDeletion.id);
								}
							}}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
