PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text,
	`name` text,
	`url` text,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_user_documents`("id", "userId", "name", "url") SELECT "id", "userId", "name", "url" FROM `user_documents`;--> statement-breakpoint
DROP TABLE `user_documents`;--> statement-breakpoint
ALTER TABLE `__new_user_documents` RENAME TO `user_documents`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_users_messages`("id", "userId", "role", "content", "createdAt") SELECT "id", "userId", "role", "content", "createdAt" FROM `users_messages`;--> statement-breakpoint
DROP TABLE `users_messages`;--> statement-breakpoint
ALTER TABLE `__new_users_messages` RENAME TO `users_messages`;