PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message_thread` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`userId` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_message_thread`("id", "name", "userId", "created_at") SELECT "id", "name", "userId", "created_at" FROM `message_thread`;--> statement-breakpoint
DROP TABLE `message_thread`;--> statement-breakpoint
ALTER TABLE `__new_message_thread` RENAME TO `message_thread`;--> statement-breakpoint
PRAGMA foreign_keys=ON;