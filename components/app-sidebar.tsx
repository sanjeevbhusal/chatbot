"use client";

import UploadFileModal from "@/app/chat/UploadFileModal";
import {
	Sidebar,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Thread } from "@/lib/types";
import type { Document } from "@/lib/types";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SidebarTabs from "./sidebar-tabs";

interface AppSidebarProps {
	activeThread?: Thread;
	setActiveDocument: (document?: Document) => void;
	setActiveThreadId: (threadId: number | null) => void;
}

export function AppSidebar({
	activeThread,
	setActiveDocument,
	setActiveThreadId,
}: AppSidebarProps) {
	const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);

	return (
		<div>
			<Sidebar>
				<SidebarHeader>
					<div className="h-12 w-40 relative">
						<Image src="/logo.svg" alt="logo" fill />
					</div>

					<SidebarMenu className="mt-2">
						<SidebarMenuItem>
							<SidebarMenuButton
								className="cursor-pointer"
								onClick={() => {
									setActiveThreadId(null);
								}}
							>
								<Plus /> New Chat
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								className="cursor-pointer"
								onClick={() => setIsUploadFileModalOpen(true)}
							>
								<Plus /> New Source
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarTabs
					setActiveDocument={setActiveDocument}
					activeThreadId={activeThread?.id}
					setActiveThreadId={setActiveThreadId}
				/>
			</Sidebar>

			<UploadFileModal
				open={isUploadFileModalOpen}
				onOpenChange={(open) => setIsUploadFileModalOpen(open)}
			/>
		</div>
	);
}
