import { useQuery } from "@tanstack/react-query";
import type { Document } from "./types";

export const useGetDocumentsQuery = () => {
	return useQuery({
		queryKey: ["documents"],
		queryFn: async () => {
			const response = await fetch("/api/document");
			const data = await response.json();
			return data.result as Document[];
		},
	});
};
