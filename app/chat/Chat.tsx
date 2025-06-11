"use client";

import type { Document } from "@/lib/types";
import { useState } from "react";
import ChatWindow from "./ChatWindow";
import DocumentViewer from "./DocumentViewer";
import Sidebar from "./Sidebar";

export default function Chat() {
	const [activeDocument, setActiveDocument] = useState<Document>();
	const [activeDocumentFromLineNo, setActiveDocumentFromLineNo] =
		useState<number>();
	const [activeDocumentToLineNo, setActiveDocumentToLineNo] =
		useState<number>();

	return (
		<div className="h-screen py-0 w-full flex">
			<div className="w-[20%] h-full relative">
				<Sidebar setActiveDocument={setActiveDocument} />
			</div>

			<div className="w-[80%] h-full p-4  border border-t-0 relative flex flex-col gap-12">
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
