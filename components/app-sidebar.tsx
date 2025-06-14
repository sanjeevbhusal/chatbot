"use client";

import UploadFileModal from "@/app/chat/UploadFileModal";
import {
	Sidebar,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import type { Thread } from "@/lib/types";
import type { Document } from "@/lib/types";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import SidebarTabs from "./sidebar-tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface AppSidebarProps {
	activeThread?: Thread;
	setActiveDocument: (document?: Document) => void;
	setActiveThreadId: (threadId: number | null) => void;
	selectedDocumentIds: number[];
	setSelectedDocumentIds: (documentIds: number[]) => void;
}

export function AppSidebar({
	activeThread,
	setActiveDocument,
	setActiveThreadId,
	selectedDocumentIds,
	setSelectedDocumentIds,
}: AppSidebarProps) {
	const [isUploadFileModalOpen, setIsUploadFileModalOpen] = useState(false);
	const sidebarState = useSidebar();

	return (
		<div>
			<Sidebar collapsible="icon">
				<SidebarHeader>
					<div className="flex items-center justify-between">
						<div className="h-12 w-40 relative">
							<Image src="/logo.svg" alt="logo" fill />
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<SidebarTrigger className="cursor-pointer" />
							</TooltipTrigger>
							<TooltipContent side={sidebarState.open ? "bottom" : "right"}>
								<span>Toggle Sidebar</span>
							</TooltipContent>
						</Tooltip>
					</div>

					<SidebarMenu className="mt-2">
						<SidebarMenuItem>
							<Tooltip>
								<TooltipTrigger asChild>
									<SidebarMenuButton
										className="cursor-pointer"
										onClick={() => {
											setActiveThreadId(null);
										}}
									>
										<Plus /> New Chat
									</SidebarMenuButton>
								</TooltipTrigger>
								<TooltipContent hidden={sidebarState.open} side="right">
									New Chat
								</TooltipContent>
							</Tooltip>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<Tooltip>
								<TooltipTrigger asChild>
									<SidebarMenuButton
										className="cursor-pointer"
										onClick={() => setIsUploadFileModalOpen(true)}
									>
										<Plus /> New Document
									</SidebarMenuButton>
								</TooltipTrigger>
								<TooltipContent hidden={sidebarState.open} side="right">
									New Document
								</TooltipContent>
							</Tooltip>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarTabs
					setActiveDocument={setActiveDocument}
					activeThreadId={activeThread?.id}
					setActiveThreadId={setActiveThreadId}
					selectedDocumentIds={selectedDocumentIds}
					setSelectedDocumentIds={setSelectedDocumentIds}
				/>
			</Sidebar>

			<UploadFileModal
				open={isUploadFileModalOpen}
				onOpenChange={(open) => setIsUploadFileModalOpen(open)}
			/>
		</div>
	);
}
