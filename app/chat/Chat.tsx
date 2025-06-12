"use client";

import type { Document, Thread } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import DocumentViewer from "./DocumentViewer";
import NewChatWindow from "./NewChatWindow";
import Sidebar from "./Sidebar";

export default function Chat() {
	const [activeDocument, setActiveDocument] = useState<Document>();
	const [activeDocumentFromLineNo, setActiveDocumentFromLineNo] =
		useState<number>();
	const [activeDocumentToLineNo, setActiveDocumentToLineNo] =
		useState<number>();
	const [activeThread, setActiveThread] = useState<Thread>();

	const [activeThreadToSet, setActiveThreadToSet] = useState<number>();

	const useGetThreadsQuery = useQuery({
		queryKey: ["threads"],
		queryFn: async () => {
			const response = await fetch("/api/threads");
			const data = await response.json();
			return data.result as Thread[];
		},
	});

	useEffect(() => {
		if (useGetThreadsQuery?.data) {
			if (activeThreadToSet) {
				const activeThread = useGetThreadsQuery.data.find(
					(thread) => thread.id === activeThreadToSet,
				);
				if (activeThread) {
					setActiveThread(activeThread);
					setActiveThreadToSet(undefined);
				}
			}
		}
	}, [useGetThreadsQuery?.data, activeThreadToSet]);

	const threads = useGetThreadsQuery?.data ?? [];

	return (
		<div className="h-screen py-0 w-full flex">
			<div className="w-[20%] h-full relative">
				<Sidebar
					activeThread={activeThread}
					setActiveDocument={setActiveDocument}
					setActiveThread={setActiveThread}
					setActiveThreadToSet={setActiveThreadToSet}
					threads={threads}
				/>
			</div>

			<div className="w-[80%] h-full border border-t-0 relative flex flex-col gap-12">
				{/* <ChatWindow
					onSelectDocument={(
						document: Document,
						fromLineNo: number,
						toLineNumber: number,
					) => {
						setActiveDocument(document);
						setActiveDocumentFromLineNo(fromLineNo);
						setActiveDocumentToLineNo(toLineNumber);
					}}
					activeThread={activeThread}
				/> */}
				<NewChatWindow
					onSelectDocument={(
						document: Document,
						fromLineNo: number,
						toLineNumber: number,
					) => {
						setActiveDocument(document);
						setActiveDocumentFromLineNo(fromLineNo);
						setActiveDocumentToLineNo(toLineNumber);
					}}
					activeThread={activeThread}
					setThreadId={(id) => setActiveThreadToSet(id)}
				/>
			</div>

			<DocumentViewer
				activeDocument={activeDocument}
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
