CREATE INDEX `user_threads_idx` ON `message_thread` (`userId`);--> statement-breakpoint
CREATE INDEX `user_documents_idx` ON `user_documents` (`userId`);--> statement-breakpoint
CREATE INDEX `thread_messages_idx` ON `users_messages` (`threadId`);