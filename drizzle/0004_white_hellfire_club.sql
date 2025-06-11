CREATE TABLE `message_sources` (
	`messageId` integer NOT NULL,
	`documentChunkId` integer NOT NULL,
	PRIMARY KEY(`messageId`, `documentChunkId`),
	FOREIGN KEY (`messageId`) REFERENCES `users_messages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`documentChunkId`) REFERENCES `documents_chunk`(`id`) ON UPDATE no action ON DELETE no action
);
