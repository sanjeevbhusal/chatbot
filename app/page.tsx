"use client";

import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

const initialMessages = [
	{
		id: 1,
		message: "Hello, how are you?",
		userName: "User 1",
		userPicture: "https://github.com/shadcn.png",
		role: "user",
	},
	{
		id: 2,
		message: "I'm good, thanks! How about you?",
		userName: "User 2",
		userPicture: "https://github.com/shadcn.png",
		role: "ai",
	},
	{
		id: 3,
		message: "I'm good, thanks! How about you?",
		userName: "User 3",
		userPicture: "https://github.com/shadcn.png",
		role: "user",
	},
	{
		id: 4,
		message: "I'm good, thanks! How about you?",
		userName: "User 4",
		userPicture: "https://github.com/shadcn.png",
		role: "ai",
	},
	{
		id: 5,
		message: "I'm good, thanks! How about you?",
		userName: "User 5",
		userPicture: "https://github.com/shadcn.png",
		role: "user",
	},
	{
		id: 6,
		message: "I'm good, thanks! How about you?",
		userName: "User 6",
		userPicture: "https://github.com/shadcn.png",
		role: "ai",
	},
	{
		id: 7,
		message: "I'm good, thanks! How about you?",
		userName: "User 7",
		userPicture: "https://github.com/shadcn.png",
		role: "user",
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

	return (
		<div className="h-screen py-0">
			<div className="w-[60rem] h-full mx-auto p-4 border border-t-0 relative flex flex-col gap-12">
				<div className="h-[86%] overflow-scroll flex flex-col gap-4">
					{messages.map((message) => (
						<Message
							key={message.id}
							messageId={message.id.toString()}
							message={message.message}
							userName={message.userName}
							userPicture={message.userPicture}
							role={message.role}
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
									userName: "User",
									userPicture: "https://github.com/shadcn.png",
									role: "user",
								},
							]);
							setTimeout(() => {
								setMessages((messages) => [
									...messages,
									{
										id: messages.length + 1,
										message: "Hello",
										userName: "AI",
										userPicture: "https://github.com/shadcn.png",
										role: "ai",
									},
								]);
							}, 500);
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
	userName,
	userPicture,
	role,
	messageId,
}: {
	message: string;
	userName: string;
	userPicture: string;
	role: "user" | "ai";
	messageId: string;
}) => {
	return (
		<div
			className={`p-2 border rounded-2xl w-fit ${
				role === "user" ? "ml-auto bg-neutral-200" : ""
			}`}
			id={messageId}
		>
			<div>{message}</div>
		</div>
	);
};
