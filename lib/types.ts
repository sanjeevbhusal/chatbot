export interface Message {
	id: number;
	content: string;
	role: "user" | "assistant";
	threadId?: number;
	sources: {
		name: string;
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

export interface Thread {
	id: number;
	name: string;
}
