CREATE TABLE `documents_chunk` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userDocumentId` integer,
	`metadata` text,
	`vector` F32_BLOB(1536),
	FOREIGN KEY (`userDocumentId`) REFERENCES `user_documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`name` text,
	`url` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text,
	`password` text
);
