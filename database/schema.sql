-- =====================================================
-- CovaSol Database Schema for MySQL/MariaDB (Laragon)
-- =====================================================
-- 
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Mở Laragon và Start All
-- 2. Vào phpMyAdmin (http://localhost/phpmyadmin)
-- 3. Tạo database mới tên: covasol
-- 4. Chọn database covasol
-- 5. Vào tab SQL và paste toàn bộ nội dung file này
-- 6. Nhấn Go để chạy
--
-- Hoặc chạy lệnh: npm run db:migrate
-- =====================================================

-- Sử dụng UTF8MB4 để hỗ trợ emoji và ký tự đặc biệt
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- Bảng 1: admin_users - Quản lý tài khoản admin
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng 2: blog_posts - Quản lý bài viết blog
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Mã bài viết duy nhất',
    slug VARCHAR(150) NOT NULL UNIQUE COMMENT 'URL-friendly slug',
    title TEXT NOT NULL COMMENT 'Tiêu đề bài viết',
    subtitle TEXT COMMENT 'Tiêu đề phụ',
    excerpt TEXT COMMENT 'Tóm tắt ngắn',
    content LONGTEXT NOT NULL COMMENT 'Nội dung HTML',
    image_url TEXT COMMENT 'URL ảnh đại diện',
    category VARCHAR(120) COMMENT 'Danh mục',
    tags TEXT COMMENT 'Tags JSON array',
    keywords TEXT COMMENT 'Keywords SEO JSON array',
    author_name VARCHAR(120) COMMENT 'Tên tác giả',
    author_role VARCHAR(120) COMMENT 'Chức vụ tác giả',
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày xuất bản',
    status VARCHAR(40) NOT NULL DEFAULT 'published' COMMENT 'Trạng thái: draft, published',
    gallery_media JSON DEFAULT NULL COMMENT 'Ảnh gallery JSON array',
    video_items JSON DEFAULT NULL COMMENT 'Video items JSON array',
    source_links JSON DEFAULT NULL COMMENT 'Nguồn tham khảo JSON array',
    is_featured TINYINT NOT NULL DEFAULT 0 COMMENT 'Bài viết nổi bật: 0 hoặc 1',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_published_at (published_at DESC),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_is_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng 3: products - Quản lý sản phẩm
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Mã sản phẩm duy nhất',
    slug VARCHAR(150) NOT NULL UNIQUE COMMENT 'URL-friendly slug',
    name TEXT NOT NULL COMMENT 'Tên sản phẩm',
    category VARCHAR(120) COMMENT 'Danh mục',
    short_description TEXT COMMENT 'Mô tả ngắn',
    description LONGTEXT COMMENT 'Mô tả chi tiết HTML',
    image_url TEXT COMMENT 'URL ảnh đại diện',
    feature_tags TEXT COMMENT 'Feature tags JSON array',
    highlights TEXT COMMENT 'Điểm nổi bật JSON array',
    cta_primary_label TEXT COMMENT 'Label nút CTA chính',
    cta_primary_url TEXT COMMENT 'URL nút CTA chính',
    cta_secondary_label TEXT COMMENT 'Label nút CTA phụ',
    cta_secondary_url TEXT COMMENT 'URL nút CTA phụ',
    gallery_media JSON DEFAULT NULL COMMENT 'Ảnh gallery JSON array',
    video_items JSON DEFAULT NULL COMMENT 'Video items JSON array',
    demo_media JSON DEFAULT NULL COMMENT 'Demo images JSON array',
    status VARCHAR(40) NOT NULL DEFAULT 'active' COMMENT 'Trạng thái: active, inactive',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng 4: sessions - Lưu trữ session đăng nhập
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT,
    
    INDEX idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Dữ liệu mẫu: Tài khoản admin mặc định
-- Password: 04042003Cova*
-- =====================================================
INSERT INTO admin_users (username, password_hash, display_name, role)
VALUES (
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4f1yqBWVHxkd0LHA',
    'Covasol Admin',
    'admin'
) ON DUPLICATE KEY UPDATE username = username;

-- =====================================================
-- HOÀN TẤT!
-- Giờ bạn có thể chạy: npm run dev
-- API sẽ chạy tại: http://localhost:3001
-- =====================================================
