CREATE TABLE `message_thread` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`userId` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `users_messages` ADD `threadId` text NOT NULL REFERENCES message_thread(id);