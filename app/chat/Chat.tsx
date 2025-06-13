"use client";

import { AppSidebar } from "@/components/app-sidebar";
import type { Document, Thread } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import DocumentViewer from "./DocumentViewer";
import NewChatWindow from "./NewChatWindow";

export default function Chat() {
	const [activeDocument, setActiveDocument] = useState<Document>();
	const [activeDocumentFromLineNo, setActiveDocumentFromLineNo] =
		useState<number>();
	const [activeDocumentToLineNo, setActiveDocumentToLineNo] =
		useState<number>();

	const [activeChatId, setActiveChatId] = useQueryState(
		"activeChatId",
		parseAsInteger,
	);

	const useGetThreadsQuery = useQuery({
		queryKey: ["threads"],
		queryFn: async () => {
			const response = await fetch("/api/threads");
			const data = await response.json();
			return data.result as Thread[];
		},
	});

	const activeThread = activeChatId
		? useGetThreadsQuery.data?.find((t) => t.id === activeChatId)
		: undefined;

	return (
		<div className="h-screen py-0 w-full flex ">
			<AppSidebar
				activeThread={activeThread}
				setActiveDocument={setActiveDocument}
				setActiveThreadId={setActiveChatId}
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
					activeThreadId={activeChatId}
					setActiveThreadId={setActiveChatId}
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
