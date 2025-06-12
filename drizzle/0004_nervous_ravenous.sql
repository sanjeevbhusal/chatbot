PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_thread` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`userId` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_message_thread`("id", "name", "userId", "created_at") SELECT "id", "name", "userId", "created_at" FROM `message_thread`;--> statement-breakpoint
DROP TABLE `message_thread`;--> statement-breakpoint
ALTER TABLE `__new_message_thread` RENAME TO `message_thread`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` text NOT NULL,
	`threadId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`threadId`) REFERENCES `message_thread`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users_messages`("id", "userId", "role", "content", "createdAt", "threadId") SELECT "id", "userId", "role", "content", "createdAt", "threadId" FROM `users_messages`;--> statement-breakpoint
DROP TABLE `users_messages`;--> statement-breakpoint
ALTER TABLE `__new_users_messages` RENAME TO `users_messages`;