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
import { Plus } from "lucide-react";
import { useState } from "react";
import SidebarTabs from "./sidebar-tabs";

import type { Document } from "@/lib/types";

interface AppSidebarProps {
	activeThread?: Thread;
	setActiveThread: (thread?: Thread) => void;
	setActiveDocument: (document?: Document) => void;
	setActiveThreadToSet: (threadId?: number) => void;
}

export function AppSidebar({
	activeThread,
	setActiveThread,
	setActiveDocument,
	setActiveThreadToSet,
}: AppSidebarProps) {
	const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);

	return (
		<div>
			<Sidebar>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								className="cursor-pointer"
								onClick={() => setActiveThread(undefined)}
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
					setActiveThread={setActiveThread}
					activeThread={activeThread}
					setActiveThreadToSet={setActiveThreadToSet}
				/>
			</Sidebar>

			<UploadFileModal
				open={isUploadFileModalOpen}
				onOpenChange={(open) => setIsUploadFileModalOpen(open)}
			/>
		</div>
	);
}
