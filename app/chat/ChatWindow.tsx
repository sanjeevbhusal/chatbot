import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Document, Message } from "@/lib/types";
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
}

export default function ChatWindow({
	messages,
	documents,
	getAnswer,
	onSelectDocument,
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
			<div className="h-[86%] overflow-scroll flex flex-col">
				{messages.map((message, index) => {
					return (
						<div id={message.id.toString()} key={message.id}>
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
															<p className="font-semibold">{document?.name}</p>
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

									{index === messages.length - 1 && (
										<Separator orientation="horizontal" className="h-2 my-8" />
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			<Textarea
				placeholder="Type your message here..."
				className="min-h-[14%] border rounded-lg p-2"
				onKeyUp={(e) => {
					if (e.key === "Enter") {
						getAnswer(e.currentTarget.value);
						e.currentTarget.value = "";
					}
				}}
			/>
		</>
	);
}
