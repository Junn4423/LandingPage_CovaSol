-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 02, 2025 at 10:00 AM
-- Server version: 8.4.3
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `covasol`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `display_name`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2a$12$CWJmJPKvZVtp6iSBisHoM.g5wzseEUEqruha8UgQGNxUrpkCRUltO', 'COVASOL Admin', 'admin', '2025-12-02 03:01:24.152', '2025-12-02 03:01:24.152');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` text COLLATE utf8mb4_unicode_ci,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` text COLLATE utf8mb4_unicode_ci,
  `keywords` text COLLATE utf8mb4_unicode_ci,
  `author_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author_role` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `gallery_media` json DEFAULT NULL,
  `video_items` json DEFAULT NULL,
  `source_links` json DEFAULT NULL,
  `is_featured` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `author_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `code`, `slug`, `title`, `subtitle`, `excerpt`, `content`, `image_url`, `category`, `tags`, `keywords`, `author_name`, `author_role`, `published_at`, `status`, `gallery_media`, `video_items`, `source_links`, `is_featured`, `created_at`, `updated_at`, `author_id`) VALUES
(1, 'BLOG-001', 'xu-huong-ai-2025', '5 xu hướng AI doanh nghiệp cần chuẩn bị cho 2025', NULL, 'Cập nhật nhanh những ứng dụng AI giúp doanh nghiệp tăng trưởng.', 'AI đang dịch chuyển từ các thử nghiệm rời rạc sang chiến lược vận hành lõi. Doanh nghiệp cần chuẩn bị nền tảng dữ liệu, kiến trúc tích hợp và văn hoá thử nghiệm để tận dụng làn sóng mới.\n\nCOVASOL đề xuất mô hình đánh giá mức độ sẵn sàng trong 4 tuần giúp doanh nghiệp xác định điểm khởi đầu rõ ràng.', NULL, 'Technology', '[\"AI\",\"Automation\",\"Digital Transformation\"]', NULL, 'COVASOL Team', 'Tech Lead', '2025-10-02 00:00:00.000', 'published', NULL, NULL, NULL, 1, '2025-12-02 03:01:24.184', '2025-12-02 03:01:24.184', 1),
(2, 'BLOG-002', 'toan-canh-product-design', 'Product Design: Từ ý tưởng đến MVP trong 6 tuần', NULL, 'Quy trình tinh gọn giúp bạn kiểm chứng giả thuyết nhanh chóng.', 'Để rút ngắn thời gian ra mắt sản phẩm, đội ngũ product cần một khung làm việc thống nhất với business và tech.\n\nCOVASOL sử dụng phương pháp 6 tuần bao gồm Discovery, Experience Design, Prototyping và Validation.', NULL, 'Design', '[\"Product\",\"Design Sprint\",\"UX\"]', NULL, 'Lan Hương', 'Product Designer', '2025-09-12 00:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-02 03:01:24.197', '2025-12-02 03:01:24.197', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customer_reviews`
--

CREATE TABLE `customer_reviews` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` float NOT NULL DEFAULT '5',
  `quote` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `bg_color` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#3B82F6',
  `status` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `is_featured` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_reviews`
--

INSERT INTO `customer_reviews` (`id`, `name`, `role`, `company`, `rating`, `quote`, `bg_color`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 'Lương Ngọc Chung', 'CEO - TechStart JSC', NULL, 5, 'Hehe', '#9C27B0', 'published', 1, '2025-12-02 04:16:35.032', '2025-12-02 04:16:35.032'),
(2, 'Trần Thị Lan', 'Giám đốc Marketing - BeautyShop', NULL, 5, 'Website và app mobile do COVASOL phát triển đã giúp doanh thu online tăng 300%. UI/UX rất đẹp và dễ sử dụng.', '#009688', 'published', 1, '2025-12-02 04:16:35.040', '2025-12-02 04:16:35.040'),
(3, 'Lê Văn Hùng', 'CTO - FinanceCore', NULL, 4.5, 'Hệ thống API và microservice rất ổn định. COVASOL hiểu rõ yêu cầu kỹ thuật và đưa ra giải pháp phù hợp.', '#FF9800', 'published', 0, '2025-12-02 04:16:35.047', '2025-12-02 04:16:35.047'),
(4, 'Phạm Thị Mai', 'Founder - EduTech Vietnam', NULL, 5, 'Nền tảng học trực tuyến được xây dựng rất chuyên nghiệp. Học sinh và giáo viên đều phản hồi tích cực về giao diện và tính năng.', '#3F51B5', 'published', 1, '2025-12-02 04:16:35.056', '2025-12-02 04:16:35.056'),
(5, 'Hoàng Đức Thánh', 'Giám đốc - Logistics Plus', NULL, 4, 'Hệ thống quản lý vận chuyển giúp tối ưu tuyến đường và giảm 25% chi phí nhiên liệu. Tính năng tracking real-time rất hữu ích.', '#E91E63', 'published', 0, '2025-12-02 04:16:35.061', '2025-12-02 04:16:35.061'),
(6, 'Nguyễn Thị Hương', 'HR Manager - GreenTech Co.', NULL, 4.5, 'App HR quản lý nhân sự rất tiện lợi. Nhân viên có thể chấm công, xin phép và theo dõi lương dễ dàng.', '#E91E63', 'published', 0, '2025-12-02 04:16:35.068', '2025-12-02 04:16:35.068'),
(7, 'Võ Minh Khôi', 'CEO - SmartHome Solutions', NULL, 5, 'Hệ thống IoT và dashboard monitoring hoạt động cực kỳ ổn định. COVASOL có kiến thức sâu về công nghệ mới nhất.', '#4CAF50', 'published', 1, '2025-12-02 04:16:35.076', '2025-12-02 04:16:35.076'),
(8, 'Đặng Thị Ngọc', 'Marketing Director - FoodieHub', NULL, 3.5, 'App giao đồ ăn ra mắt đúng tiến độ. Một số tính năng cần tiếp tục hoàn thiện nhưng nhìn chung đã đáp ứng yêu cầu cốt lõi.', '#FF9800', 'published', 0, '2025-12-02 04:16:35.083', '2025-12-02 04:16:35.083'),
(9, 'Trịnh Vân Nam', 'Owner - RetailChain VN', NULL, 5, 'Hệ thống POS và quản lý chuỗi cửa hàng hoạt động mượt mà. Báo cáo thống kê chi tiết giúp ra quyết định chính xác.', '#8BC34A', 'published', 0, '2025-12-02 04:16:35.091', '2025-12-02 04:16:35.091'),
(10, 'Lữ Thị Đinh', 'CFO - InvestSmart', NULL, 4, 'Nền tảng fintech được phát triển với tính bảo mật cao. API tích hợp ngân hàng hoạt động ổn định và tuân thủ quy định.', '#795548', 'published', 0, '2025-12-02 04:16:35.097', '2025-12-02 04:16:35.097'),
(11, 'Bùi Hoàng Long', 'CTO - HealthCare Tech', NULL, 4.5, 'Hệ thống quản lý bệnh viện giúp số hoá quy trình khám chữa bệnh. Bác sĩ và bệnh nhân đều hài lòng.', '#00BCD4', 'published', 0, '2025-12-02 04:16:35.103', '2025-12-02 04:16:35.103'),
(12, 'Cao Thị Minh', 'Operations Manager - LogiFlow', NULL, 4, 'Automation workflow tiết kiệm 40% thời gian xử lý đơn hàng. Tích hợp với các hệ thống có sẵn rất mượt.', '#673AB7', 'published', 0, '2025-12-02 04:16:35.110', '2025-12-02 04:16:35.110'),
(13, 'Đinh Văn Tài', 'Founder - AgriTech Vietnam', NULL, 5, 'Nền tảng nông nghiệp thông minh kết nối nông dân với người tiêu dùng rất hiệu quả. Giao diện dễ dùng cho mọi lứa tuổi.', '#03A9F4', 'published', 0, '2025-12-02 04:16:35.115', '2025-12-02 04:16:35.115'),
(14, 'Võ Thị Thu', 'Brand Manager - FashionHub', NULL, 3.5, 'Website thương mại điện tử có thiết kế đẹp mắt. Một số chức năng checkout cần tối ưu thêm để tăng conversion rate.', '#E91E63', 'published', 0, '2025-12-02 04:16:35.124', '2025-12-02 04:16:35.124'),
(15, 'Phan Minh Đức', 'IT Manager - AutoService', NULL, 4.5, 'Hệ thống quản lý garage ô tô với booking online rất tiện lợi. Khách hàng có thể đặt lịch và theo dõi tiến độ sửa chữa.', '#795548', 'published', 0, '2025-12-02 04:16:35.130', '2025-12-02 04:16:35.130'),
(16, 'Đỗ Thị Linh', 'Director - RealEstate Pro', NULL, 4, 'Nền tảng bất động sản có tính năng tìm kiếm thông minh và bản đồ tương tác. Giúp tăng 50% leads chất lượng.', '#00BCD4', 'published', 0, '2025-12-02 04:16:35.138', '2025-12-02 04:16:35.138'),
(17, 'Hà Quang Minh', 'CEO - TravelSmart', NULL, 5, 'App du lịch với AI recommendation rất ấn tượng. Khách hàng có thể lên kế hoạch và đặt trọn bộ chuyến đi chỉ trong vài click.', '#2196F3', 'published', 0, '2025-12-02 04:16:35.145', '2025-12-02 04:16:35.145'),
(18, 'Ngô Thị Vân', 'Product Manager - SportsTech', NULL, 3.5, 'App thể thao với tracking workout khá tốt. Performance tracking chính xác nhưng UI cần cải thiện để thân thiện hơn.', '#03A9F4', 'published', 0, '2025-12-02 04:16:35.152', '2025-12-02 04:16:35.152'),
(19, 'Lương Văn Khang', 'Technical Lead - CloudFirst', NULL, 4.5, 'Migration từ on-premise lên cloud do COVASOL thực hiện rất chuyên nghiệp. Zero downtime và hiệu năng tăng đáng kể.', '#00BCD4', 'published', 0, '2025-12-02 04:16:35.159', '2025-12-02 04:16:35.159'),
(20, 'Trương Thị Hạnh', 'COO - MediaStreaming', NULL, 4, 'Nền tảng streaming video có khả năng scale tốt. Xử lý hàng nghìn user cùng lúc mà không bị lag hay buffering.', '#673AB7', 'published', 0, '2025-12-02 04:16:35.165', '2025-12-02 04:16:35.165');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `feature_tags` text COLLATE utf8mb4_unicode_ci,
  `highlights` text COLLATE utf8mb4_unicode_ci,
  `cta_primary_label` text COLLATE utf8mb4_unicode_ci,
  `cta_primary_url` text COLLATE utf8mb4_unicode_ci,
  `cta_secondary_label` text COLLATE utf8mb4_unicode_ci,
  `cta_secondary_url` text COLLATE utf8mb4_unicode_ci,
  `gallery_media` json DEFAULT NULL,
  `video_items` json DEFAULT NULL,
  `demo_media` json DEFAULT NULL,
  `status` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `code`, `slug`, `name`, `category`, `short_description`, `description`, `image_url`, `feature_tags`, `highlights`, `cta_primary_label`, `cta_primary_url`, `cta_secondary_label`, `cta_secondary_url`, `gallery_media`, `video_items`, `demo_media`, `status`, `created_at`, `updated_at`) VALUES
(1, 'PROD-001', 'virtual-assistant', 'Virtual Assistant Platform', 'AI', 'Trợ lý AI đa kênh - Trả lời khách hàng tự động qua web, Zalo OA và Facebook Messenger.', 'Nền tảng trợ lý ảo được thiết kế chuyên biệt cho doanh nghiệp Việt với khả năng hiểu ngôn ngữ tự nhiên và tích hợp hệ thống sẵn có. Bộ workflow builder trực quan giúp đội CSKH tự điều chỉnh kịch bản chỉ trong vài phút.', '/images/products/virtual-assistant.png', '[\"AI\",\"Chatbot\",\"Multi-channel\"]', '[\"Kết nối đa kênh (Web Widget, Facebook, Zalo OA, Hotline)\",\"Hệ thống đào tạo tri thức từ tài liệu nội bộ\",\"Dashboard realtime phân tích hội thoại\"]', 'Dùng thử miễn phí', '/contact', NULL, NULL, NULL, NULL, NULL, 'active', '2025-12-02 03:01:24.206', '2025-12-02 03:01:24.206'),
(2, 'PROD-002', 'manufacturing-mes', 'Manufacturing MES', 'MES', 'Giải pháp điều hành sản xuất - Tối ưu dây chuyền với dashboard thời gian thực.', 'Hệ thống MES tập trung giúp giám sát hiệu suất từng chuyền và đồng bộ dữ liệu với ERP hiện hữu. Giải pháp hỗ trợ cả mô hình on-premise lẫn cloud để phù hợp yêu cầu bảo mật.', '/images/products/mes.png', '[\"MES\",\"Manufacturing\",\"IoT\"]', '[\"Giám sát OEE và downtime realtime\",\"Quản lý lệnh sản xuất và truy xuất nguồn gốc\",\"Ứng dụng di động cho tổ trưởng\"]', 'Đặt lịch demo', '/contact', NULL, NULL, NULL, NULL, NULL, 'active', '2025-12-02 03:01:24.219', '2025-12-02 03:01:24.219'),
(3, 'PROD-003', 'iot-monitoring', 'IoT Monitoring System', 'IoT', 'Hệ thống giám sát IoT - Theo dõi thiết bị và cảm biến với dashboard realtime.', 'Nền tảng IoT cho phép thu thập dữ liệu từ hàng nghìn thiết bị, xử lý realtime và đưa ra cảnh báo thông minh. Tích hợp AI để dự đoán bảo trì và tối ưu vận hành.', '/images/products/iot.png', '[\"IoT\",\"Monitoring\",\"Predictive\"]', '[\"Thu thập dữ liệu từ nhiều loại cảm biến\",\"Dashboard realtime và báo cáo tự động\",\"AI dự đoán bảo trì preventive\"]', 'Liên hệ tư vấn', '/contact', NULL, NULL, NULL, NULL, NULL, 'active', '2025-12-02 03:01:24.227', '2025-12-02 03:01:24.227');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_users_username_key` (`username`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_posts_code_key` (`code`),
  ADD UNIQUE KEY `blog_posts_slug_key` (`slug`),
  ADD KEY `idx_published_at` (`published_at` DESC),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `blog_posts_author_id_fkey` (`author_id`);

--
-- Indexes for table `customer_reviews`
--
ALTER TABLE `customer_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_review_status` (`status`),
  ADD KEY `idx_review_featured` (`is_featured`),
  ADD KEY `idx_review_created` (`created_at` DESC);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_code_key` (`code`),
  ADD UNIQUE KEY `products_slug_key` (`slug`),
  ADD KEY `idx_product_status` (`status`),
  ADD KEY `idx_product_category` (`category`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_expires` (`expires`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customer_reviews`
--
ALTER TABLE `customer_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
