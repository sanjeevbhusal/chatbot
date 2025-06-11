"use client";

import type { Document, Message } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import DocumentViewer from "./DocumentViewer";
import Sidebar from "./Sidebar";

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [activeDocument, setActiveDocument] = useState<Document>();
	const [activeDocumentFromLineNo, setActiveDocumentFromLineNo] =
		useState<number>();
	const [activeDocumentToLineNo, setActiveDocumentToLineNo] =
		useState<number>();

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

		const response = await fetch("/api/answer", {
			method: "POST",
			body: JSON.stringify({ question }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();

		setMessages((messages) => [
			...messages,
			{
				id: data.result.id,
				content: data.result.content,
				role: data.result.role,
				sources: data.result.sources,
			},
		]);
	};

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

	useEffect(() => {
		const getDocuments = async () => {
			const response = await fetch("/api/document");
			const data = await response.json();
			setDocuments(data.result);
		};

		getDocuments();
	}, []);

	return (
		<div className="h-screen py-0 w-full flex">
			<div className="w-[20%] h-full relative">
				<Sidebar documents={documents} setActiveDocument={setActiveDocument} />
			</div>

			<div className="w-[80%] h-full p-4  border border-t-0 relative flex flex-col gap-12">
				<ChatWindow
					hasInitialMessagesLoaded={initialMessagesQuery.status === "success"}
					messages={messages}
					documents={documents}
					onSelectDocument={(
						document: Document,
						fromLineNo: number,
						toLineNumber: number,
					) => {
						setActiveDocument(document);
						setActiveDocumentFromLineNo(fromLineNo);
						setActiveDocumentToLineNo(toLineNumber);
					}}
					getAnswer={getAnswer}
				/>
			</div>

			<DocumentViewer
				activeDocument={activeDocument}
				documents={documents}
				onClose={() => {
					setActiveDocument(undefined);
					setActiveDocumentFromLineNo(undefined);
					setActiveDocumentToLineNo(undefined);
				}}
				onSelectDocument={(document) => {
					setActiveDocument(document);
					setActiveDocumentFromLineNo(undefined);
					setActiveDocumentToLineNo(undefined);
				}}
				activeDocumentFromLineNo={activeDocumentFromLineNo}
				activeDocumentToLineNo={activeDocumentToLineNo}
			/>
		</div>
	);
}
