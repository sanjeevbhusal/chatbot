"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { UploadButton } from "@/lib/uploadThing";
import { useEffect, useState } from "react";

const initialMessages = [
	{
		id: 1,
		message: "Hello, how are you?",
		role: "user",
		sources: [],
	},
	{
		id: 2,
		message: "I'm good, thanks! How about you?",
		role: "ai",
		sources: [],
	},
	{
		id: 3,
		message: "Tell me about your company's SOC 2 policy?",
		role: "user",
		sources: [],
	},
	{
		id: 4,
		message:
			"Sure. Acme Corp did its SOC 2 Report in 12th October, 2024. It was done by a reputed third party. Will you like to know more?",
		role: "ai",
		sources: [],
	},
	{
		id: 5,
		message: "Yes. I want to know more about the SOC 2 report.",
		role: "user",
		sources: [],
	},
	{
		id: 6,
		message:
			"Sure. Acme Corp's SOC 2 report has a rating of 5/5 provided by xyz company. The company follows all SOC 2 principles such as Security, Availability, Confidentiality, Privacy and Processing integrity.",
		role: "ai",
		sources: [],
	},
];

export default function Home() {
	const [messages, setMessages] = useState(initialMessages);

	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		document
			.getElementById(lastMessage.id.toString())
			?.scrollIntoView({ behavior: "instant" });
	}, [messages]);

	const getAnswer = async (question: string) => {
		const response = await fetch(`/api/answer?question=${question}`);
		const data = await response.json();
		setMessages((messages) => [
			...messages,
			{
				id: messages.length + 1,
				message: data.answer,
				role: "ai",
				sources: [],
			},
		]);
	};

	const createEmbeddings = async () => {
		await fetch("/api/documents", {
			method: "POST",
		});
	};

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
							message={message.message}
							role={message.role}
							sources={message.sources}
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
									message: e.currentTarget.value,
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
	role: "user" | "ai";
	sources: { id: string; name: string }[];
	isLastMessage: boolean;
}) => {
	return (
		<div id={messageId}>
			{role === "user" && (
				<div className="text-2xl font-bold mr-4">{message}</div>
			)}

			{role === "ai" && (
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
