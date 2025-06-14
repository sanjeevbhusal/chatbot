import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { useGetDocumentsQuery } from "@/lib/queries";
import type { Document, Message } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UploadFileModal from "./UploadFileModal";

interface ChatWindowProps {
	onSelectDocument: (
		document: Document,
		fromLineNo: number,
		toLineNo: number,
	) => void;
	activeThreadId: number | null;
	setActiveThreadId: (threadId: number | null) => void;
}

export default function NewChatWindow({
	onSelectDocument,
	activeThreadId,
	setActiveThreadId,
}: ChatWindowProps) {
	const sidebar = useSidebar();

	const [messages, setMessages] = useState<Message[]>([]);
	const [isNoDocumentExistsModalOpen, setIsNoDocumentExistsModalOpen] =
		useState(false);
	const { data: session } = authClient.useSession();
	const queryClient = useQueryClient();
	const router = useRouter();

	const getDocumentsQuery = useGetDocumentsQuery();

	const initialMessagesQuery = useQuery({
		queryKey: ["messages", activeThreadId],
		queryFn: async () => {
			const response = await fetch(`/api/answer?threadId=${activeThreadId}`);
			const data = await response.json();
			return data.result as Message[];
		},
		// only fetch the messages if there is a active thread and no messages have been sent
		enabled: !!activeThreadId,
	});

	const getAnswerMutation = useMutation({
		mutationFn: async (question: string) => {
			const response = await fetch("/api/answer", {
				method: "POST",
				body: JSON.stringify({ question, threadId: activeThreadId }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			const message = data.result as Message;
			setActiveThreadId(message.threadId ?? null);
			return message;
		},
		onSuccess: (data) => {
			setMessages((messages) => [
				...messages,
				{
					id: data.id,
					content: data.content,
					role: data.role,
					threadId: data.threadId,
					sources: data.sources,
				},
			]);
			queryClient.invalidateQueries({
				queryKey: ["threads"],
			});
		},
	});

	const logoutMutation = useMutation({
		mutationFn: async () => {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => router.push("/"),
				},
			});
		},
	});

	const getAnswer = async (question: string) => {
		setMessages((messages) => [
			...messages,
			{
				id: messages.length + 1,
				content: question,
				role: "user",
				sources: [],
			},
		]);

		getAnswerMutation.mutate(question);
	};

	useEffect(() => {
		if (!activeThreadId) {
			setMessages([]);
		}
	}, [activeThreadId]);

	// Populate messages for this thread
	useEffect(() => {
		if (initialMessagesQuery?.data) {
			setMessages(initialMessagesQuery.data);
		}
	}, [initialMessagesQuery?.data]);

	// set the flag to true if no documents exist.
	useEffect(() => {
		if (
			getDocumentsQuery.data &&
			getDocumentsQuery.data.length === 0 &&
			!getDocumentsQuery.isFetching
		) {
			setIsNoDocumentExistsModalOpen(true);
		}
	}, [getDocumentsQuery.data, getDocumentsQuery.isFetching]);

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage) {
			document
				.getElementById(lastMessage.id.toString())
				?.scrollIntoView({ behavior: "instant" });
		}
	}, [messages]);

	const documentsQuery = useGetDocumentsQuery();
	const documents = documentsQuery.data ?? [];

	const renderAvatarName = (name: string) => {
		if (!name) return "";

		const splits = name.split(" ");
		const firstCharacter = splits[0].charAt(0);
		const secondCharacter =
			splits.length === 1 ? splits[0].charAt(1) : splits[1].charAt(0);
		return firstCharacter.toUpperCase() + secondCharacter.toUpperCase();
	};

	return (
		<div className="h-full flex flex-col">
			<div className="basis-[50px] grow-0 shrink-0 border-b px-4 py-2 flex justify-between items-center bg-white">
				<Tooltip>
					<TooltipTrigger asChild>
						<SidebarTrigger />
					</TooltipTrigger>
					<TooltipContent>
						<span>Toggle Sidebar</span>
					</TooltipContent>
				</Tooltip>
				{!sidebar.open && (
					<div className="h-10 w-32 relative">
						<Image src="/logo.svg" alt="logo" fill />
					</div>
				)}
				<div>
					{" "}
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-fit ml-auto">
							<Avatar className="cursor-pointer">
								<AvatarImage
									src={session?.user.image ?? ""}
									className="h-8 w-8 rounded-full"
									alt={session?.user.name ?? ""}
								/>
								<AvatarFallback className="h-8 w-8">
									{renderAvatarName(session?.user.name ?? "")}
								</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="bottom" align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.preventDefault();
									logoutMutation.mutate();
								}}
							>
								Logout{" "}
								{logoutMutation.isPending && (
									<Loader2 className="animate-spin" />
								)}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div
				className={clsx("basis-[50px] grow overflow-scroll", {
					"basis-[250px] grow-0": messages.length === 0,
				})}
			>
				{messages.map((message, index) => {
					return (
						<div
							className={clsx(
								"px-12 mb-8",
								{ "mt-10": index === 0 },
								{
									"mb-10":
										index === messages.length - 1 &&
										!getAnswerMutation.isPending,
								},
							)}
							id={message.id.toString()}
							key={message.id}
						>
							{message.role === "user" && (
								<div className="text-2xl font-bold mr-4">{message.content}</div>
							)}

							{message.role === "assistant" && (
								<div>
									<div className="font-bold mt-4">Sources</div>
									<p className="mt-2">
										{message.sources.length > 0 ? (
											<div className="flex flex-col gap-2">
												{message.sources.map((source) => {
													const document = documents.find(
														(document) => document.id === source.userDocumentId,
													);
													if (!document) return null;
													return (
														<div
															className="flex gap-4 items-center"
															key={`${message.id}-${source.linesFrom}-${source.linesTo}`}
														>
															<Button
																variant="link"
																className="text-blue-500 p-0 h-fit"
																onClick={() => {
																	onSelectDocument(
																		document,
																		source.linesFrom,
																		source.linesTo,
																	);
																}}
															>
																{document?.name} (Lines {source.linesFrom} -{" "}
																{source.linesTo})
															</Button>
														</div>
													);
												})}
											</div>
										) : (
											"No Sources Found"
										)}
									</p>

									<div className="font-bold mt-4">Answer</div>
									<p className="mt-2">{message.content}</p>

									{index !== messages.length - 1 && (
										<Separator orientation="horizontal" className="h-2 mt-8" />
									)}
								</div>
							)}
						</div>
					);
				})}

				{getAnswerMutation.isPending && (
					<p className="text-xl flex gap-2 items-center px-12 mb-12">
						<div className="flex items-center space-x-3 text-gray-600 text-sm">
							<div className="flex h-full items-center space-x-1">
								<div className="h-5 animate-bounce  animation-delay-200">
									<div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
								</div>
								<div className="h-5 animate-bounce animation-delay-300">
									<div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
								</div>
								<div className="h-5 animate-bounce animation-delay-400">
									<div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
								</div>
							</div>
							<p className="mb-4 text-lg">Thinking...</p>
						</div>
					</p>
				)}
			</div>

			{messages.length === 0 ? (
				<div className="w-full flex items-center gap-8 flex-col">
					<div className="text-2xl">
						Ask any questions against the documents uploaded
					</div>
					<Textarea
						placeholder="What do you want to know?"
						className="text-lg! p-4 mx-4 basis-[100px] grow-0 shrink-0 border rounded-lg w-[70%]"
						onKeyUp={(e) => {
							if (e.key === "Enter") {
								getAnswer(e.currentTarget.value);
								e.currentTarget.value = "";
							}
						}}
						disabled={getAnswerMutation.isPending}
					/>
				</div>
			) : (
				<Textarea
					placeholder="Ask any question"
					className="text-lg! mb-8 basis-[100px] grow-0 shrink-0 border rounded-lg w-[calc(100%-96px)] mx-auto"
					onKeyUp={(e) => {
						if (e.key === "Enter") {
							getAnswer(e.currentTarget.value);
							e.currentTarget.value = "";
						}
					}}
					disabled={getAnswerMutation.isPending}
				/>
			)}

			<UploadFileModal
				open={isNoDocumentExistsModalOpen}
				onSuccess={() => setIsNoDocumentExistsModalOpen(false)}
			/>
		</div>
	);
}
