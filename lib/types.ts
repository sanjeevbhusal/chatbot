export interface Message {
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

export interface Document {
	id: number;
	name: string;
	url: string;
	userId: string;
}
