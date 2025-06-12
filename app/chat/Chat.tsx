"use client";

import type { Document, Thread } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import DocumentViewer from "./DocumentViewer";
import Sidebar from "./Sidebar";

export default function Chat() {
	const [activeDocument, setActiveDocument] = useState<Document>();
	const [activeDocumentFromLineNo, setActiveDocumentFromLineNo] =
		useState<number>();
	const [activeDocumentToLineNo, setActiveDocumentToLineNo] =
		useState<number>();
	const [activeThread, setActiveThread] = useState<Thread>();

	// TODO: create a thread when user creates an account.
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
			setActiveThread(useGetThreadsQuery.data[0]);
		}
	}, [useGetThreadsQuery?.data]);

	const threads = useGetThreadsQuery?.data ?? [];

	return (
		<div className="h-screen py-0 w-full flex">
			<div className="w-[20%] h-full relative">
				<Sidebar
					setActiveDocument={setActiveDocument}
					setActiveThread={setActiveThread}
					threads={threads}
				/>
			</div>

			<div className="w-[80%] h-full border border-t-0 relative flex flex-col gap-12">
				<ChatWindow
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
