-- Add Google OAuth columns to users table
-- Run this migration to support Google login

ALTER TABLE `users` 
ADD COLUMN `google_id` VARCHAR(255) DEFAULT NULL UNIQUE,
ADD COLUMN `name` VARCHAR(255) DEFAULT NULL,
ADD COLUMN `picture` VARCHAR(500) DEFAULT NULL,
MODIFY COLUMN `password_hash` VARCHAR(255) DEFAULT NULL,
MODIFY COLUMN `username` VARCHAR(100) DEFAULT NULL;

-- Create index for google_id for faster lookups
CREATE INDEX `idx_google_id` ON `users`(`google_id`);
