CREATE TABLE `lead_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`leadCount` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`csvFileKey` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lead_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadListId` int NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerName` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`stripePaymentIntentId` varchar(255) NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`downloadedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_stripePaymentIntentId_unique` UNIQUE(`stripePaymentIntentId`)
);
