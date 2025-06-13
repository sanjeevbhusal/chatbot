"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Document, Thread } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import DocumentViewer from "./DocumentViewer";
import NewChatWindow from "./NewChatWindow";

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

	return (
		<div className="h-screen py-0 w-full flex ">
			<AppSidebar
				activeThread={activeThread}
				setActiveThread={setActiveThread}
				setActiveDocument={setActiveDocument}
				setActiveThreadToSet={setActiveThreadToSet}
			/>

			<div className="flex-grow h-full relative flex flex-col gap-12">
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
