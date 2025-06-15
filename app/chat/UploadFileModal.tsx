"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useGetDocumentsQuery } from "@/lib/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircleIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UploadFileProps {
	onUpload: (file: File) => void;
}

function UploadFile({ onUpload }: UploadFileProps) {
	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-center w-full">
				<label
					htmlFor="dropzone-file"
					className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
				>
					<div className="flex flex-col items-center justify-center pt-5 pb-6">
						<svg
							role="img"
							aria-label="Upload File Icon"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="w-10 h-10 text-gray-400"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" x2="12" y1="3" y2="15" />
						</svg>
						<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
							<span className="font-semibold">Click to upload</span>
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Supported File Types: .txt
							{/* SVG, PNG, JPG or GIF (MAX. 800x400px) */}
						</p>
					</div>
					<input
						id="dropzone-file"
						type="file"
						className="hidden"
						onChange={(e) => {
							const files = e.target.files;
							if (files) {
								onUpload(files[0]);
							}
						}}
						accept=".txt"
					/>
				</label>
			</div>
		</div>
	);
}

interface UploadFileModalProps {
	open: boolean;
	onOpenChange?: (value: boolean) => void;
	onSuccess?: () => void;
}

export default function UploadFileModal({
	open,
	onOpenChange,
	onSuccess,
}: UploadFileModalProps) {
	const documentsQuery = useGetDocumentsQuery();
	const [file, setFile] = useState<File>();
	const queryClient = useQueryClient();

	const uploadSourceMutation = useMutation({
		mutationFn: async () => {
			const formData = new FormData();
			if (file) {
				formData.append("file", file);
			}

			await fetch("/api/document", {
				method: "POST",
				body: formData,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["documents"],
			});
			onOpenChange?.(false);
			onSuccess?.();

			toast.success("Document has been added to the source", {
				position: "top-center",
			});
		},
	});

	const displayAlert =
		documentsQuery.data &&
		documentsQuery.data.length === 0 &&
		!documentsQuery.isFetching;

	return (
		<Dialog
			open={open}
			onOpenChange={() => {
				if (uploadSourceMutation.isPending) return;
				onOpenChange?.(!open);
				setFile(undefined);
			}}
		>
			<DialogContent
				className="w-[600px]"
				disableCloseButton={uploadSourceMutation.isPending}
			>
				<DialogHeader>
					<DialogTitle>Upload File</DialogTitle>
					<DialogDescription>
						Upload a file to add it to your sources.
					</DialogDescription>
				</DialogHeader>

				{displayAlert && (
					<Alert variant="destructive" className="mt-2">
						<AlertCircleIcon />
						<AlertTitle>No Documents Available.</AlertTitle>
						<AlertDescription>
							You need to upload atleast 1 document to interact with the
							application
						</AlertDescription>
					</Alert>
				)}

				<UploadFile onUpload={(file) => setFile(file)} />

				{file && (
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">{file.name}</p>
							<p className="text-sm text-muted-foreground">
								{(file.size / 1024).toFixed(2)} KB
							</p>
						</div>
					</div>
				)}

				<Alert>
					<AlertCircleIcon />
					<AlertTitle className="block">
						Uploading a document can take some time.
					</AlertTitle>
				</Alert>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={uploadSourceMutation.isPending}>
							Cancel
						</Button>
					</DialogClose>
					<Button
						type="submit"
						disabled={!file}
						onClick={() => {
							uploadSourceMutation.mutate();
						}}
					>
						Upload
						{uploadSourceMutation.isPending && (
							<Loader2 className="animate-spin" />
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
