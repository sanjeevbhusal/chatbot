"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadThing";
import { useEffect, useState } from "react";

interface Message {
	id: number;
	content: string;
	role: "user" | "assistant";
	// sources: [];
}

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([]);

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
				// sources: [],
			},
		]);
	};

	useEffect(() => {
		const getMessages = async () => {
			const response = await fetch("/api/answer");
			const data = await response.json();
			console.log({ data });
			setMessages(data.result);
		};

		getMessages();
	}, []);

	console.log({ messages });

	return (
		<div className="h-screen py-0">
			<div className="w-[60rem] h-full mx-auto p-4 pr-0 border border-t-0 relative flex flex-col gap-12">
				<div className="h-[86%] overflow-scroll flex flex-col">
					{/* <Button onClick={createEmbeddings}>Create Embeddings</Button> */}

					<UploadButton
						endpoint="imageUploader"
						onClientUploadComplete={(res) => {
							// Do something with the response
							console.log("Files: ", res);
							alert("Upload Completed");
						}}
						onUploadError={(error: Error) => {
							// Do something with the error.
							alert(`ERROR! ${error.message}`);
						}}
					/>

					{messages.map((message, id) => (
						<Message
							key={message.id}
							messageId={message.id.toString()}
							message={message.content}
							role={message.role}
							sources={[]}
							isLastMessage={id === messages.length - 1}
						/>
					))}
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
									// sources: [],
								},
							]);
							getAnswer(e.currentTarget.value);
							e.currentTarget.value = "";
						}
					}}
				/>
			</div>
		</div>
	);
}

const Message = ({
	message,
	role,
	messageId,
	sources,
	isLastMessage,
}: {
	messageId: string;
	message: string;
	role: "user" | "assistant";
	sources: { id: string; name: string }[];
	isLastMessage: boolean;
}) => {
	return (
		<div id={messageId}>
			{role === "user" && (
				<div className="text-2xl font-bold mr-4">{message}</div>
			)}

			{role === "assistant" && (
				<div>
					<div className="font-bold mt-4">Sources</div>
					<p className="mt-2">No Sources Found</p>
					<div className="font-bold mt-4">Answer</div>
					<p className="mt-2">{message}</p>
					{!isLastMessage && (
						<Separator orientation="horizontal" className="h-2 w-full my-8" />
					)}
				</div>
			)}
		</div>
	);
};
