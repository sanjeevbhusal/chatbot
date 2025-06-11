import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useGetDocumentsQuery } from "@/lib/queries";
import type { Document, Message } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatWindowProps {
	onSelectDocument: (
		document: Document,
		fromLineNo: number,
		toLineNo: number,
	) => void;
}

export default function ChatWindow({ onSelectDocument }: ChatWindowProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isReplyPending, setIsReplyPending] = useState(false);

	const initialMessagesQuery = useQuery({
		queryKey: ["messages"],
		queryFn: async () => {
			const response = await fetch("/api/answer");
			const data = await response.json();
			const messages = data.result as Message[];
			setMessages(messages);
			return messages;
		},
	});

	const getAnswerMutation = useMutation({
		mutationFn: async (question: string) => {
			const response = await fetch("/api/answer", {
				method: "POST",
				body: JSON.stringify({ question }),
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await response.json();
			return data.result as Message;
		},
		onSuccess: (data) => {
			setMessages((messages) => [
				...messages,
				{
					id: data.id,
					content: data.content,
					role: data.role,
					sources: data.sources,
				},
			]);
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

	return (
		<>
			<div
				className={clsx("h-[86%] overflow-scroll flex flex-col", {
					"flex items-center justify-center": !hasInitialMessagesLoaded,
				})}
			>
				{hasInitialMessagesLoaded ? (
					messages.map((message, index) => {
						return (
							<div id={message.id.toString()} key={message.id}>
								{message.role === "user" && (
									<div className="text-2xl font-bold mr-4">
										{message.content}
									</div>
								)}

								{message.role === "assistant" && (
									<div>
										<div className="font-bold mt-4">Sources</div>
										<p className="mt-2">
											{message.sources.length > 0 ? (
												<div className="flex flex-col gap-2">
													{message.sources.map((source) => {
														const document = documents.find(
															(document) =>
																document.id === source.userDocumentId,
														);
														if (!document) return null;
														return (
															<div
																className="flex gap-4 items-center"
																key={source.id}
															>
																<p className="font-semibold">
																	{document?.name}
																</p>
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
																	View (Lines {source.linesFrom} -{" "}
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
											<Separator
												orientation="horizontal"
												className="h-2 my-8"
											/>
										)}
									</div>
								)}
							</div>
						);
					})
				) : (
					<div className="flex flex-col items-center gap-2 text-2xl">
						<span>Loading Messages ...</span>
						<Loader2 className="animate-spin" />
					</div>
				)}
			</div>

			{isReplyPending && (
				<p className="text-xl flex gap-2 items-center">
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

			<Textarea
				placeholder={
					documentsQuery.status === "success" && documents.length === 0
						? "Please add at least 1 source before asking questions"
						: "Type your message here..."
				}
				className="min-h-[14%] border rounded-lg p-2 disabled:text-black disabled:opacity-100 disabled:text-lg"
				onKeyUp={(e) => {
					if (e.key === "Enter") {
						getAnswer(e.currentTarget.value);
						e.currentTarget.value = "";
					}
				}}
				disabled={
					isReplyPending || documents.length === 0 || !hasInitialMessagesLoaded
				}
			/>
		</>
	);
}
