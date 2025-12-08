-- CreateTable
CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password_hash` TEXT NOT NULL,
    `display_name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `title` TEXT NOT NULL,
    `subtitle` TEXT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `image_url` TEXT NULL,
    `category` VARCHAR(120) NULL,
    `tags` TEXT NULL,
    `keywords` TEXT NULL,
    `author_name` VARCHAR(120) NULL,
    `author_role` VARCHAR(120) NULL,
    `published_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(40) NOT NULL DEFAULT 'published',
    `gallery_media` JSON NULL,
    `video_items` JSON NULL,
    `source_links` JSON NULL,
    `is_featured` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `author_id` INTEGER NULL,

    UNIQUE INDEX `blog_posts_code_key`(`code`),
    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    INDEX `idx_published_at`(`published_at` DESC),
    INDEX `idx_status`(`status`),
    INDEX `idx_category`(`category`),
    INDEX `idx_is_featured`(`is_featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(150) NOT NULL,
    `name` TEXT NOT NULL,
    `category` VARCHAR(120) NULL,
    `short_description` TEXT NULL,
    `description` LONGTEXT NULL,
    `image_url` TEXT NULL,
    `feature_tags` TEXT NULL,
    `highlights` TEXT NULL,
    `cta_primary_label` TEXT NULL,
    `cta_primary_url` TEXT NULL,
    `cta_secondary_label` TEXT NULL,
    `cta_secondary_url` TEXT NULL,
    `gallery_media` JSON NULL,
    `video_items` JSON NULL,
    `demo_media` JSON NULL,
    `status` VARCHAR(40) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_code_key`(`code`),
    UNIQUE INDEX `products_slug_key`(`slug`),
    INDEX `idx_product_status`(`status`),
    INDEX `idx_product_category`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NULL,
    `rating` FLOAT NOT NULL DEFAULT 5,
    `quote` TEXT NOT NULL,
    `bg_color` VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
    `status` VARCHAR(40) NOT NULL DEFAULT 'published',
    `is_featured` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_review_status`(`status`),
    INDEX `idx_review_featured`(`is_featured`),
    INDEX `idx_review_created`(`created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visit_stats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(255) NULL,
    `visit_count` INTEGER NOT NULL DEFAULT 1,
    `last_visited_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_visit_ip`(`ip_address`),
    INDEX `idx_visit_last`(`last_visited_at` DESC),
    UNIQUE INDEX `ux_visit_ip`(`ip_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cookie_consents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(255) NULL,
    `consented` BOOLEAN NOT NULL DEFAULT true,
    `preferences` JSON NULL,
    `consented_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_cookie_ip`(`ip_address`),
    INDEX `idx_cookie_time`(`consented_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `session_id` VARCHAR(128) NOT NULL,
    `expires` INTEGER UNSIGNED NOT NULL,
    `data` MEDIUMTEXT NULL,

    INDEX `idx_expires`(`expires`),
    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
