-- CreateTable
CREATE TABLE `system_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(100) NOT NULL,
    `resource` VARCHAR(100) NOT NULL,
    `resource_id` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(500) NULL,
    `user_id` INTEGER NULL,
    `username` VARCHAR(100) NULL,
    `method` VARCHAR(10) NULL,
    `path` VARCHAR(500) NULL,
    `status_code` INTEGER NULL,
    `duration` INTEGER NULL,
    `request_body` JSON NULL,
    `response_size` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_syslog_ip`(`ip_address`),
    INDEX `idx_syslog_user`(`user_id`),
    INDEX `idx_syslog_action`(`action`),
    INDEX `idx_syslog_resource`(`resource`),
    INDEX `idx_syslog_time`(`created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocked_ips` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `threat_score` FLOAT NOT NULL DEFAULT 0,
    `request_count` INTEGER NOT NULL DEFAULT 0,
    `blocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `blocked_by` INTEGER NULL,
    `blocked_by_name` VARCHAR(100) NULL,
    `expires_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blocked_ips_ip_address_key`(`ip_address`),
    INDEX `idx_blocked_ip`(`ip_address`),
    INDEX `idx_blocked_active`(`is_active`),
    INDEX `idx_blocked_threat`(`threat_score`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ip_analytics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip_address` VARCHAR(45) NOT NULL,
    `hour_window` DATETIME(3) NOT NULL,
    `request_count` INTEGER NOT NULL DEFAULT 0,
    `unique_paths` INTEGER NOT NULL DEFAULT 0,
    `error_count` INTEGER NOT NULL DEFAULT 0,
    `avg_duration` FLOAT NOT NULL DEFAULT 0,
    `user_agents` INTEGER NOT NULL DEFAULT 1,
    `threat_indicators` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_ipanalytics_ip`(`ip_address`),
    INDEX `idx_ipanalytics_hour`(`hour_window`),
    INDEX `idx_ipanalytics_count`(`request_count`),
    UNIQUE INDEX `ux_ip_hour`(`ip_address`, `hour_window`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seasonal_themes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `primary_color` VARCHAR(20) NOT NULL,
    `secondary_color` VARCHAR(20) NOT NULL,
    `accent_color` VARCHAR(20) NULL,
    `effect_type` VARCHAR(50) NULL,
    `effect_config` JSON NULL,
    `effect_enabled` BOOLEAN NOT NULL DEFAULT true,
    `disable_on_mobile` BOOLEAN NOT NULL DEFAULT true,
    `decorations` JSON NULL,
    `background_image_url` TEXT NULL,
    `banner_image_url` TEXT NULL,
    `banner_text` VARCHAR(255) NULL,
    `banner_link` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seasonal_themes_code_key`(`code`),
    INDEX `idx_seasonal_active`(`is_active`),
    INDEX `idx_seasonal_dates`(`start_date`, `end_date`),
    INDEX `idx_seasonal_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seasonal_theme_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seasonal_theme_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_categories_code_key`(`code`),
    UNIQUE INDEX `blog_categories_name_key`(`name`),
    INDEX `idx_blog_category_code`(`code`),
    INDEX `idx_blog_category_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_categories_code_key`(`code`),
    UNIQUE INDEX `product_categories_name_key`(`name`),
    INDEX `idx_product_category_code`(`code`),
    INDEX `idx_product_category_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_views` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blog_post_id` INTEGER NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` VARCHAR(500) NULL,
    `viewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_blog_view_post`(`blog_post_id`),
    INDEX `idx_blog_view_time`(`viewed_at` DESC),
    UNIQUE INDEX `ux_blog_view_ip`(`blog_post_id`, `ip_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blog_post_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_comment_blog`(`blog_post_id`),
    INDEX `idx_comment_status`(`status`),
    INDEX `idx_comment_time`(`created_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletter_subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `source` VARCHAR(50) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `subscribed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unsubscribed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `newsletter_subscriptions_email_key`(`email`),
    INDEX `idx_newsletter_email`(`email`),
    INDEX `idx_newsletter_status`(`status`),
    INDEX `idx_newsletter_subscribed`(`subscribed_at` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
