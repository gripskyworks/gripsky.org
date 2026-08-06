CREATE TABLE `email_rate_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`scope` text NOT NULL,
	`subject_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`claim_id` text
);
--> statement-breakpoint
CREATE INDEX `email_rate_events_scope_subject_created_at_idx` ON `email_rate_events` (`scope`,`subject_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `email_rate_events_claim_id_idx` ON `email_rate_events` (`claim_id`);--> statement-breakpoint
CREATE TABLE `update_deliveries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publication_id` integer NOT NULL,
	`subscriber_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` integer NOT NULL,
	`claim_token` text,
	`provider_message_id` text,
	`last_error` text,
	`created_at` integer NOT NULL,
	`sent_at` integer,
	FOREIGN KEY (`publication_id`) REFERENCES `update_publications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `update_deliveries_publication_subscriber_unique` ON `update_deliveries` (`publication_id`,`subscriber_id`);--> statement-breakpoint
CREATE INDEX `update_deliveries_status_next_attempt_idx` ON `update_deliveries` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE TABLE `update_publications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`topic` text NOT NULL,
	`title_en` text NOT NULL,
	`title_zh` text NOT NULL,
	`summary_en` text NOT NULL,
	`summary_zh` text NOT NULL,
	`url` text NOT NULL,
	`published_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `update_publications_slug_unique` ON `update_publications` (`slug`);--> statement-breakpoint
ALTER TABLE `subscribers` ADD `public_id` text;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `unsubscribed_at` integer;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `suppression_reason` text;--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_public_id_unique` ON `subscribers` (`public_id`);