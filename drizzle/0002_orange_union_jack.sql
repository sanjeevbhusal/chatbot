PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_documents_chunk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userDocumentId` integer,
	`metadata` text,
	`content` text,
	`vector` F32_BLOB(1536),
	FOREIGN KEY (`userDocumentId`) REFERENCES `user_documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_documents_chunk`("id", "userDocumentId", "metadata", "content", "vector") SELECT "id", "userDocumentId", "metadata", "content", "vector" FROM `documents_chunk`;--> statement-breakpoint
DROP TABLE `documents_chunk`;--> statement-breakpoint
ALTER TABLE `__new_documents_chunk` RENAME TO `documents_chunk`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_message_sources` (
	`messageId` integer NOT NULL,
	`documentChunkId` integer NOT NULL,
	PRIMARY KEY(`messageId`, `documentChunkId`),
	FOREIGN KEY (`messageId`) REFERENCES `users_messages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`documentChunkId`) REFERENCES `documents_chunk`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_message_sources`("messageId", "documentChunkId") SELECT "messageId", "documentChunkId" FROM `message_sources`;--> statement-breakpoint
DROP TABLE `message_sources`;--> statement-breakpoint
ALTER TABLE `__new_message_sources` RENAME TO `message_sources`;