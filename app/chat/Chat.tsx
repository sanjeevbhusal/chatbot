"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadThing";
import { useEffect, useState } from "react";
import "@cyntler/react-doc-viewer/dist/index.css";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import DocViewer, {
	DocViewerRenderers,
	type IHeaderOverride,
} from "@cyntler/react-doc-viewer";
import { Avatar } from "@radix-ui/react-avatar";
import clsx from "clsx";
import { CircleHelp, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Message {
	id: number;
	content: string;
	role: "user" | "assistant";
	sources: {
		id: number;
		userDocumentId: number;
		linesFrom: number;
		linesTo: number;
	}[];
}

interface Document {
	id: number;
	name: string;
	url: string;
	userId: string;
}

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [documents, setDocuments] = useState<Document[]>([]);
	const [activeDocument, setActiveDocument] = useState<Document>();
	const [activeDocumentFromLineNo, setActiveDocumentFromLineNo] =
		useState<number>();
	const [activeDocumentToLineNo, setActiveDocumentToLineNo] =
		useState<number>();
	const router = useRouter();

	const {
		data: session,
		isPending, //loading state
		error, //error object
		refetch, //refetch the session
	} = authClient.useSession();

	console.log({ session, isPending, error });

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage) {
			document
				.getElementById(lastMessage.id.toString())
				?.scrollIntoView({ behavior: "instant" });
		}
	}, [messages]);

	const getAnswer = async (question: string) => {
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
				id: messages.length + 1,
				content: data.result,
				role: "assistant",
				sources: [],
			},
		]);
	};

	useEffect(() => {
		const getMessages = async () => {
			const response = await fetch("/api/answer");
			const data = await response.json();
			setMessages(data.result);
		};

		getMessages();
	}, []);

	useEffect(() => {
		const getDocuments = async () => {
			const response = await fetch("/api/document");
			const data = await response.json();
			setDocuments(data.result);
		};

		getDocuments();
	}, []);

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
		<div className="h-screen py-0 w-full flex">
			<div className="w-[20%] h-full relative">
				<div className="flex justify-between gap-2 px-4 py-2">
					<div className="flex items-center gap-2 font-semibold text-xl">
						<span>Sources </span>
						<Tooltip>
							<TooltipTrigger>
								<CircleHelp />
							</TooltipTrigger>
							<TooltipContent>
								The AI Model will answer your questions from the documents
								uploaded.
							</TooltipContent>
						</Tooltip>{" "}
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-fit ml-auto">
							<Avatar>
								<AvatarImage
									src={session?.user.image ?? ""}
									className="h-10 w-10 rounded-full"
									alt={session?.user.name ?? ""}
								/>
								<AvatarFallback>{session?.user.name}</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="top">
							<DropdownMenuItem
								onClick={async () => {
									await authClient.signOut({
										fetchOptions: {
											onSuccess: () => router.push("/sign-in"),
										},
									});
								}}
							>
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<Separator />

				<UploadButton
					endpoint="documentsUploader"
					onClientUploadComplete={(res) => {
						// Do something with the response
						alert("Upload Completed");
					}}
					onUploadError={(error: Error) => {
						// Do something with the error.
						alert(`ERROR! ${error.message}`);
					}}
					content={{
						button: (
							<p className="flex items-center gap-2">
								<Plus /> Add Document
							</p>
						),
					}}
					className="p-4 w-full ut-allowed-content:hidden ut-button:w-full"
				/>

				{documents.length === 0 ? (
					<p className="p-4 text-slate-600">No Documents Uploaded</p>
				) : (
					<div className="flex flex-col gap-2 p-4">
						{documents.map((document) => (
							<div className="flex gap-4 items-center" key={document.id}>
								<p className="font-semibold">{document.name}</p>
								<Button
									variant="link"
									className="text-blue-500 p-0 h-fit"
									onClick={() => setActiveDocument(document)}
								>
									View
								</Button>
							</div>
						))}
					</div>
				)}

				<div className="flex flex-col gap-2 p-4">
					{documents.map((document) => (
						<div className="flex gap-4 items-center" key={document.id}>
							<p className="font-semibold">{document.name}</p>
							<Button
								variant="link"
								className="text-blue-500 p-0 h-fit"
								onClick={() => setActiveDocument(document)}
							>
								View
							</Button>
						</div>
					))}
				</div>
			</div>

			<div className="w-[80%] h-full p-4  border border-t-0 relative flex flex-col gap-12">
				<div className="h-[86%] overflow-scroll flex flex-col">
					{messages.map((message, id) => {
						return (
							<Message
								key={message.id}
								messageId={message.id.toString()}
								message={message.content}
								role={message.role}
								sources={message.sources}
								isLastMessage={id === messages.length - 1}
								documents={documents}
								setActiveDocument={setActiveDocument}
								setActiveDocumentFromLineNo={setActiveDocumentFromLineNo}
								setActiveDocumentToLineNo={setActiveDocumentToLineNo}
							/>
						);
					})}
				</div>

				<Textarea
					placeholder="Type your message here..."
					className="min-h-[14%] border rounded-lg p-2"
					onKeyUp={(e) => {
						if (e.key === "Enter") {
							setMessages([
								...messages,
								{
									id: messages.length + 1,
									content: e.currentTarget.value,
									role: "user",
									sources: [],
								},
							]);
							getAnswer(e.currentTarget.value);
							e.currentTarget.value = "";
						}
					}}
				/>
			</div>

			<Dialog
				open={!!activeDocument}
				onOpenChange={() => {
					setActiveDocument(undefined);
					setActiveDocumentFromLineNo(undefined);
					setActiveDocumentToLineNo(undefined);
				}}
			>
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
										onClick={() => {
											setActiveDocument(document);
											setActiveDocumentFromLineNo(undefined);
											setActiveDocumentToLineNo(undefined);
										}}
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
		</div>
	);
}

const Message = ({
	message,
	role,
	messageId,
	sources,
	isLastMessage,
	documents,
	setActiveDocument,
	setActiveDocumentFromLineNo,
	setActiveDocumentToLineNo,
}: {
	messageId: string;
	message: string;
	role: "user" | "assistant";
	sources: {
		id: number;
		userDocumentId: number;
		linesFrom: number;
		linesTo: number;
	}[];
	isLastMessage: boolean;
	documents: Document[];
	setActiveDocument: (document: Document | undefined) => void;
	setActiveDocumentFromLineNo: (number: number) => void;
	setActiveDocumentToLineNo: (number: number) => void;
}) => {
	return (
		<div id={messageId}>
			{role === "user" && (
				<div className="text-2xl font-bold mr-4">{message}</div>
			)}

			{role === "assistant" && (
				<div>
					<div className="font-bold mt-4">Sources</div>
					<p className="mt-2">
						{sources.length > 0 ? (
							<div className="flex flex-col gap-2">
								{sources.map((source) => {
									const document = documents.find(
										(document) => document.id === source.userDocumentId,
									);
									return (
										<div className="flex gap-4 items-center" key={source.id}>
											<p className="font-semibold">{document?.name}</p>
											<Button
												variant="link"
												className="text-blue-500 p-0 h-fit"
												onClick={() => {
													setActiveDocument(document);
													setActiveDocumentFromLineNo(source.linesFrom);
													setActiveDocumentToLineNo(source.linesTo);
												}}
											>
												View (Lines {source.linesFrom} - {source.linesTo})
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
					<p className="mt-2">{message}</p>
					{!isLastMessage && (
						<Separator orientation="horizontal" className="h-2 my-8" />
					)}
				</div>
			)}
		</div>
	);
};
