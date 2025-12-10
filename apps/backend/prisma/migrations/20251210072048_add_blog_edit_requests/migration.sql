-- CreateTable
CREATE TABLE `blog_edit_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blog_post_id` INTEGER NOT NULL,
    `requester_id` INTEGER NOT NULL,
    `proposed_data` JSON NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `review_note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,

    INDEX `idx_edit_request_blog`(`blog_post_id`),
    INDEX `idx_edit_request_requester`(`requester_id`),
    INDEX `idx_edit_request_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_edit_requests` ADD CONSTRAINT `blog_edit_requests_blog_post_id_fkey` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_edit_requests` ADD CONSTRAINT `blog_edit_requests_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `admin_users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
