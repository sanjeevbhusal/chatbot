import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Document } from "@/lib/types";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import clsx from "clsx";
import { useEffect } from "react";

interface DocumentViewerProps {
	activeDocument?: Document;
	documents: Document[];
	onClose: () => void;
	onSelectDocument: (document: Document) => void;
	activeDocumentFromLineNo?: number;
	activeDocumentToLineNo?: number;
}

export default function DocumentViewer({
	activeDocument,
	documents,
	onClose,
	onSelectDocument,
	activeDocumentFromLineNo,
	activeDocumentToLineNo,
}: DocumentViewerProps) {
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
				highlightedElement?.scrollIntoView({ behavior: "smooth" });
			}, 100);

			clearInterval(interval);
		}, 50);
	}, [activeDocument, activeDocumentFromLineNo, activeDocumentToLineNo]);

	return (
		<Dialog open={!!activeDocument} onOpenChange={onClose}>
			<DialogContent className="w-[80%] h-[90%]" style={{ maxWidth: "none" }}>
				<div className="flex gap-2 h-full">
					<div className="flex flex-col gap-2 basis-40 shrink-0">
						{documents.map((document) => (
							<div className={"flex gap-4 items-center"} key={document.id}>
								<Button
									variant="link"
									className={clsx("p-0 font-semibold", {
										"text-blue-500": document.id === activeDocument?.id,
									})}
									onClick={() => onSelectDocument(document)}
								>
									{document.name}
								</Button>
							</div>
						))}
					</div>

					<Separator orientation="vertical" />
					<div className="px-4 flex flex-col">
						<DialogHeader className="pb-4 basis-10 shrink-0">
							<DialogTitle>{activeDocument?.name}</DialogTitle>
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
