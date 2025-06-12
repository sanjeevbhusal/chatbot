import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useGetDocumentsQuery } from "@/lib/queries";
import type { Document, Message, Thread } from "@/lib/types";
import {
	QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ChatWindowProps {
	onSelectDocument: (
		document: Document,
		fromLineNo: number,
		toLineNo: number,
	) => void;
	activeThread?: Thread;
	setThreadId: (threadId?: number) => void;
}

export default function NewChatWindow({
	onSelectDocument,
	activeThread,
	setThreadId,
}: ChatWindowProps) {
	// If messages array is empty, treat the conversation like a new conversation. The search box should be at the middle etc.
	// Once user submits the message, the message is appended to messages array. Now, treat the conversation like an existing conversation. We will still not have thread id though.
	// Once the reply comes in, invalidate the threads endpoint. You will refetch the threads. Newly created thread will be displayed in the side bar. Select that thread as an active thread. You don't need to do any sor of routing at all.

	const [messages, setMessages] = useState<Message[]>([]);
	const [isReplyPending, setIsReplyPending] = useState(false);
	const { data: session } = authClient.useSession();
	const router = useRouter();

	// If user decides on a new chat, clear the message history.
	useEffect(() => {
		if (!activeThread) {
			setMessages([]);
		}
	}, [activeThread]);

	const initialMessagesQuery = useQuery({
		queryKey: ["messages", activeThread?.id],
		queryFn: async () => {
			const response = await fetch(`/api/answer?threadId=${activeThread?.id}`);
			const data = await response.json();
			return data.result as Message[];
		},
		enabled: !!activeThread,
	});

	useEffect(() => {
		return () => {
			setMessages([]);
		};
	}, []);

	useEffect(() => {
		if (initialMessagesQuery?.data) {
			setMessages(initialMessagesQuery.data);
		}
	}, [initialMessagesQuery?.data]);

	const queryClient = useQueryClient();

	const getAnswerMutation = useMutation({
		mutationFn: async (question: string) => {
			const response = await fetch("/api/answer", {
				method: "POST",
				body: JSON.stringify({ question, threadId: activeThread?.id }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			const message = data.result as Message;
			setThreadId(message.threadId);
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
		onSettled: () => {
			setIsReplyPending(false);
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
		setIsReplyPending(true);

		getAnswerMutation.mutate(question);
	};

	const documentsQuery = useGetDocumentsQuery();
	const documents = documentsQuery.data ?? [];

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage) {
			document
				.getElementById(lastMessage.id.toString())
				?.scrollIntoView({ behavior: "instant" });
		}
	}, [messages]);

	const hasInitialMessagesLoaded = initialMessagesQuery.status === "success";

	const newWindowBehaviour = messages.length === 0;

	// <div className="flex flex-col items-center gap-2 text-2xl">
	// 	<span>Loading Messages ...</span>
	// 	<Loader2 className="animate-spin" />
	// </div>;

	return (
		<div className="h-full flex flex-col">
			<div className="basis-[50px] grow-0 shrink-0 border-b px-4 py-2 flex justify-between items-center bg-white">
				<span className="text-xl font-bold">
					{activeThread?.name ?? "ChatBot"}
				</span>
				<div>
					{" "}
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
								"px-4 mb-8",
								{ "mt-10": index === 0 },
								{ "mb-10": index === messages.length - 1 },
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
															key={source.id}
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

				{isReplyPending && (
					<p className="text-xl flex gap-2 items-center px-4 mt-4">
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

			{messages.length === 0 && (
				<div className="w-full flex items-center gap-8 flex-col">
					<div className="text-2xl">
						Ask me any questions against the documents you have uploaded
					</div>
					<Textarea
						placeholder={
							documentsQuery.status === "success" && documents.length === 0
								? "Please add at least 1 source before asking questions"
								: "Type your message here..."
						}
						className="w-[80%] mx-4 basis-[100px] grow-0 shrink-0 border rounded-lg px-6 py-4 disabled:text-black disabled:opacity-100 disabled:text-lg placeholder:text-lg not-[disabled]:text-lg"
						onKeyUp={(e) => {
							if (e.key === "Enter") {
								getAnswer(e.currentTarget.value);
								e.currentTarget.value = "";
							}
						}}
						// disabled={
						// 	isReplyPending ||
						// 	documents.length === 0 ||
						// 	!hasInitialMessagesLoaded
						// }
					/>
				</div>
			)}

			{!newWindowBehaviour && (
				<Textarea
					placeholder={
						documentsQuery.status === "success" && documents.length === 0
							? "Please add at least 1 source before asking questions"
							: "Type your message here..."
					}
					className="mx-4 w-[calc(100%-32px)] basis-[100px] grow-0 shrink-0 border rounded-lg p-2 disabled:text-black disabled:opacity-100 disabled:text-lg mb-8"
					onKeyUp={(e) => {
						if (e.key === "Enter") {
							getAnswer(e.currentTarget.value);
							e.currentTarget.value = "";
						}
					}}
					disabled={
						isReplyPending ||
						documents.length === 0 ||
						!hasInitialMessagesLoaded
					}
				/>
			)}
		</div>
	);
}
