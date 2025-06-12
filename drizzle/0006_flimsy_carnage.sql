PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` text NOT NULL,
	`threadId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`threadId`) REFERENCES `message_thread`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users_messages`("id", "userId", "role", "content", "createdAt", "threadId") SELECT "id", "userId", "role", "content", "createdAt", "threadId" FROM `users_messages`;--> statement-breakpoint
DROP TABLE `users_messages`;--> statement-breakpoint
ALTER TABLE `__new_users_messages` RENAME TO `users_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;