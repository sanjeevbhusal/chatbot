import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import "@cyntler/react-doc-viewer/dist/index.css";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetDocumentsQuery } from "@/lib/queries";
import type { Document } from "@/lib/types";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useEffect } from "react";

interface DocumentViewerProps {
	activeDocument?: Document;
	onClose: () => void;
	onSelectDocument: (document: Document) => void;
	activeDocumentFromLineNo?: number;
	activeDocumentToLineNo?: number;
}

export default function DocumentViewer({
	activeDocument,
	onClose,
	onSelectDocument,
	activeDocumentFromLineNo,
	activeDocumentToLineNo,
}: DocumentViewerProps) {
	const documentsQuery = useGetDocumentsQuery();
	const documents = documentsQuery.data ?? [];

	useEffect(() => {
		if (!activeDocument || !activeDocumentFromLineNo || !activeDocumentToLineNo)
			return;

		// Run a interval every 50 millisecond to see if the document has been loaded succesfully.
		const interval = setInterval(() => {
			const container = document.getElementById("txt-renderer");
			if (!container) return;

			const text = container.textContent;
			if (!text) return;

			const lines = text.split("\n");

			for (let i = activeDocumentFromLineNo; i <= activeDocumentToLineNo; i++) {
				const text = lines[i];
				const wrappingLine = `<span class="highlighted">${text}</span>`;
				lines[i] = wrappingLine;
			}

			container.innerHTML = lines.join("\n");

			setTimeout(() => {
				const highlightedElement =
					container.getElementsByClassName("highlighted")[0];
				highlightedElement?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 100);

			clearInterval(interval);
		}, 50);
	}, [activeDocument, activeDocumentFromLineNo, activeDocumentToLineNo]);

	return (
		<Dialog open={!!activeDocument} onOpenChange={onClose}>
			<DialogContent
				className="w-[90%] sm:w-[80%] h-[90%]"
				style={{ maxWidth: "none" }}
			>
				<div className="flex gap-2 h-full">
					<div className="px-4 flex flex-col">
						<DialogHeader className="pb-4 basis-10 shrink-0">
							<Select
								value={activeDocument?.id.toString()}
								onValueChange={(documentId) => {
									const doc = documents.find(
										(document) => document.id === Number(documentId),
									);
									if (doc) {
										onSelectDocument(doc);
									}
								}}
							>
								<SelectTrigger className="w-[180px]">
									<DialogTitle asChild>
										<SelectValue />
									</DialogTitle>
								</SelectTrigger>
								<SelectContent>
									{documents.map((document) => {
										return (
											<SelectItem
												key={document.id}
												value={document.id.toString()}
											>
												{document.name}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>

							{/* <DialogTitle>{activeDocument?.name}</DialogTitle> */}
						</DialogHeader>
						<div className="overflow-scroll basis-10 grow">
							<DocViewer
								activeDocument={
									activeDocument
										? {
												uri: activeDocument.url,
												fileName: activeDocument.name,
											}
										: undefined
								}
								documents={documents.map((doc) => ({
									uri: doc.url,
									fileName: doc.name,
								}))}
								pluginRenderers={DocViewerRenderers}
								className="w-full h-full"
								config={{
									header: {
										disableHeader: true,
									},
								}}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
