import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Document, Message } from "@/lib/types";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ChatWindowProps {
	messages: Message[];
	documents: Document[];
	onSelectDocument: (
		document: Document,
		fromLineNo: number,
		toLineNo: number,
	) => void;
	getAnswer: (question: string) => Promise<void>;
	hasInitialMessagesLoaded: boolean;
}

export default function ChatWindow({
	messages,
	documents,
	getAnswer,
	onSelectDocument,
	hasInitialMessagesLoaded,
}: ChatWindowProps) {
	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage) {
			document
				.getElementById(lastMessage.id.toString())
				?.scrollIntoView({ behavior: "instant" });
		}
	}, [messages]);

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

			<Textarea
				placeholder={
					documents.length === 0
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
				disabled={documents.length === 0 || !hasInitialMessagesLoaded}
			/>
		</>
	);
}
