PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_sources` (
	`messageId` integer NOT NULL,
	`documentChunkId` integer NOT NULL,
	PRIMARY KEY(`messageId`, `documentChunkId`),
	FOREIGN KEY (`messageId`) REFERENCES `users_messages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`documentChunkId`) REFERENCES `documents_chunk`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_message_sources`("messageId", "documentChunkId") SELECT "messageId", "documentChunkId" FROM `message_sources`;--> statement-breakpoint
DROP TABLE `message_sources`;--> statement-breakpoint
ALTER TABLE `__new_message_sources` RENAME TO `message_sources`;--> statement-breakpoint
PRAGMA foreign_keys=ON;