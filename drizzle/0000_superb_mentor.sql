CREATE TABLE `contact_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`kind` text NOT NULL,
	`brief` text NOT NULL,
	`locale` text DEFAULT 'zh' NOT NULL,
	`status` text DEFAULT 'recorded' NOT NULL,
	`created_at` integer NOT NULL,
	`forwarded_at` integer
);
--> statement-breakpoint
CREATE INDEX `contact_requests_created_at_idx` ON `contact_requests` (`created_at`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`locale` text DEFAULT 'zh' NOT NULL,
	`topics` text NOT NULL,
	`status` text DEFAULT 'verified' NOT NULL,
	`created_at` integer NOT NULL,
	`verified_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `subscription_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`code_hash` text NOT NULL,
	`locale` text DEFAULT 'zh' NOT NULL,
	`topics` text NOT NULL,
	`expires_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`requested_at` integer NOT NULL,
	`consumed_at` integer
);
--> statement-breakpoint
CREATE INDEX `subscription_codes_email_idx` ON `subscription_codes` (`email`);--> statement-breakpoint
CREATE INDEX `subscription_codes_requested_at_idx` ON `subscription_codes` (`requested_at`);