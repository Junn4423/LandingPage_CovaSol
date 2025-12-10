-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 10, 2025 at 09:16 AM
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
  `updated_at` datetime(3) NOT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `display_name`, `role`, `created_at`, `updated_at`, `avatar`) VALUES
(1, 'admin', '$2a$12$irp9odkaNlL7cDV.13LpHOk2wnOku7B741QD.MyEjtgjf./kxcwom', 'COVASOL Admin', 'SUPER_ADMIN', '2025-12-08 09:34:47.336', '2025-12-10 06:50:25.182', 'https://res.cloudinary.com/dky6wyvnm/image/upload/v1765349417/landing_page_assets/users/avatars/logocova.png'),
(5, 'BaoNguyen', '$2a$12$y7HIj9qv7iCC3TyIUbYEsuLEpA7uYn02NlK5IAI9by2Bl4TbgDfqW', 'Kế Bảo', 'ADMIN', '2025-12-09 09:49:05.808', '2025-12-10 08:11:43.763', NULL),
(6, 'CongCao', '$2a$12$PviMGf9fn70pb5BS0K/zOOwENl8FjZoet9wHWbtCt0zbQeuzZuNSm', 'Tấn Công', 'ADMIN', '2025-12-09 09:50:16.554', '2025-12-10 06:22:13.172', NULL),
(7, 'DungNguyen', '$2a$12$97ZzD6zXa6N8i.ZxtCwDNuGo0CW6niAm/RDE4Q6qyQc6aX2clZ9.C', 'Thế Dũng', 'ADMIN', '2025-12-09 09:50:40.101', '2025-12-10 06:22:10.691', NULL),
(8, 'ThachNguyen', '$2a$12$dRI6uYLGh7qodF6maPk6cOYFrTyD99XKCQiB/DQdx3DEtXtHfOSoK', 'Ngọc Thạch', 'ADMIN', '2025-12-09 09:51:14.136', '2025-12-10 06:22:07.870', NULL),
(9, 'HaoLam', '$2a$12$L9CJebD1XByTVqvYyNXUI.6r6/46LJv19GYRJgvVR2kXLlVtVfTaC', 'Anh Hào', 'ADMIN', '2025-12-09 09:51:55.581', '2025-12-10 06:22:04.081', NULL),
(10, 'HieuPhan', '$2a$12$CKelqY4KDLMrVOX55Emv8OGS1j5PDGN8bGHFUDGSF60yNulldNIWq', 'Công Hiệu', 'ADMIN', '2025-12-09 09:52:14.999', '2025-12-10 06:22:01.316', NULL),
(11, 'TaiLe', '$2a$12$SKl7uY/EFCx8Z/S6BuiUvup1a33u1iHuf1bq9tlV5j/NgXGF1Cs6i', 'Hữu Tài', 'ADMIN', '2025-12-09 09:52:36.564', '2025-12-10 06:21:58.357', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `blog_edit_requests`
--

CREATE TABLE `blog_edit_requests` (
  `id` int NOT NULL,
  `blog_post_id` int NOT NULL,
  `requester_id` int NOT NULL,
  `proposed_data` json NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `review_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewed_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_edit_requests`
--

INSERT INTO `blog_edit_requests` (`id`, `blog_post_id`, `requester_id`, `proposed_data`, `status`, `review_note`, `created_at`, `reviewed_at`) VALUES
(1, 288, 5, '{\"slug\": \"adawwwww-blog20251210113417\", \"tags\": [\"aaaaaaaaaaaaa\"], \"title\": \"chung test\", \"status\": \"published\", \"content\": \"aaaaaaaaaaaaaaaaaa\\n\\naaaaaaaaaaaaaa\\na\\na\\na\\na\\na\\na\\n\\n\\na\\n\\na\\na\\n\", \"excerpt\": \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\", \"category\": \"aaaaaaaaa\", \"imageUrl\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341162/landing_page_assets/blog/hero/logocova.png\", \"keywords\": [\"aaaaaaaaaaaaa\"], \"subtitle\": \"aaaaaaaaaaaaa\", \"authorName\": \"aaaaaaaaaa\", \"authorRole\": \"aaaaaaaaaaa\", \"isFeatured\": true, \"publishedAt\": \"2025-12-09T17:32:00.000Z\", \"galleryMedia\": [{\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341195/landing_page_assets/blog/gallery/logo.png\", \"type\": \"inline\", \"position\": 0}, {\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341213/landing_page_assets/blog/inline/logocova.png\", \"type\": \"inline\", \"caption\": \"aaa\", \"position\": 2}, {\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341243/landing_page_assets/blog/inline/Screenshot_2025-12-05_101133.png\", \"type\": \"inline\", \"caption\": \"aaa\", \"position\": 4}]}', 'rejected', 'nô', '2025-12-10 07:28:47.291', '2025-12-10 07:55:01.176'),
(2, 289, 7, '{\"slug\": \"aaaaaaaaa-blog20251210135422\", \"tags\": [\"aaaaaaaaaa\"], \"title\": \"aaaaaaaaaaaaaa\", \"status\": \"published\", \"content\": \"bbbbbbbbbbbbbbbbbbbbbbb\", \"excerpt\": \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\", \"category\": \"aaaaaa\", \"imageUrl\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765349145/landing_page_assets/album/logocova.png\", \"keywords\": [\"aaaaaaaaaaaaaaa\"], \"subtitle\": \"aaaaaaaaaaaa\", \"authorName\": \"Kế Bảo\", \"authorRole\": \"Biên tập viên\", \"isFeatured\": true, \"publishedAt\": \"2025-12-10T06:54:00.000Z\"}', 'rejected', 'nô', '2025-12-10 07:30:16.421', '2025-12-10 07:42:59.365'),
(3, 290, 5, '{\"slug\": \"chuyen-doi-so-machuyen-doi-so-ma-blog20251210144958\", \"tags\": [\"chuyển đổi số má\"], \"title\": \"chuyển cục cứt\", \"status\": \"published\", \"content\": \"chuyển đổi số máchuyển đổi số máchuyển đổi số má\\n\\nchuyển đổi số máchuyển đổi số máchuyển đổi số máchuyển đổi số má\\n\", \"excerpt\": \"chuyển đổi số má\", \"category\": \"chuyển đổi số má\", \"imageUrl\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765347692/landing_page_assets/album/Screenshot_2025-12-10_101233.png\", \"keywords\": [\"chuyển đổi số má\"], \"subtitle\": \"chuyển đổi số má\", \"authorName\": \"Thế Dũng\", \"authorRole\": \"chuyển đổi số má\", \"isFeatured\": true, \"publishedAt\": \"2025-12-10T07:50:00.000Z\", \"galleryMedia\": [{\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765349145/landing_page_assets/album/logocova.png\", \"type\": \"inline\", \"position\": 2}]}', 'approved', NULL, '2025-12-10 07:53:17.047', '2025-12-10 07:54:03.797');

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
  `author_id` int DEFAULT NULL,
  `author_avatar` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `code`, `slug`, `title`, `subtitle`, `excerpt`, `content`, `image_url`, `category`, `tags`, `keywords`, `author_name`, `author_role`, `published_at`, `status`, `gallery_media`, `video_items`, `source_links`, `is_featured`, `created_at`, `updated_at`, `author_id`, `author_avatar`) VALUES
(3, 'BLOG-COVA-001', 'gioi-thieu-covasol-doi-tac-chuyen-doi-so', 'CovaSol - Đối Tác Chuyển Đổi Số Đáng Tin Cậy Cho Doanh Nghiệp Việt', 'Hành trình kiến tạo giá trị qua công nghệ', 'CovaSol tự hào là đơn vị tiên phong trong lĩnh vực phát triển phần mềm và chuyển đổi số tại Việt Nam. Với đội ngũ kỹ sư giàu kinh nghiệm, chúng tôi cam kết mang đến những giải pháp công nghệ tối ưu, giúp doanh nghiệp vượt qua thách thức và bứt phá trong kỷ nguyên số.', '<article class=\"blog-content\">\r\n  <h2>Về CovaSol - Khởi nguồn từ đam mê công nghệ</h2>\r\n  <p><strong>CovaSol</strong> (viết tắt của <em>Cova Solutions</em>) được thành lập với sứ mệnh mang công nghệ tiên tiến đến gần hơn với doanh nghiệp Việt Nam. Chúng tôi tin rằng mỗi doanh nghiệp, dù lớn hay nhỏ, đều xứng đáng được tiếp cận những giải pháp phần mềm chất lượng cao với chi phí hợp lý.</p>\r\n\r\n  <h3>🎯 Tầm nhìn của chúng tôi</h3>\r\n  <p>Trở thành đối tác công nghệ hàng đầu, đồng hành cùng doanh nghiệp Việt trong hành trình chuyển đổi số, góp phần xây dựng nền kinh tế số thịnh vượng.</p>\r\n\r\n  <h3>💡 Sứ mệnh</h3>\r\n  <ul>\r\n    <li><strong>Tối ưu hóa quy trình:</strong> Giúp doanh nghiệp tiết kiệm thời gian, chi phí thông qua tự động hóa</li>\r\n    <li><strong>Nâng cao trải nghiệm:</strong> Xây dựng sản phẩm số với UX/UI hiện đại, thân thiện người dùng</li>\r\n    <li><strong>Tăng trưởng bền vững:</strong> Cung cấp giải pháp có khả năng mở rộng theo sự phát triển của doanh nghiệp</li>\r\n  </ul>\r\n\r\n  <h3>🛠️ Lĩnh vực chuyên môn</h3>\r\n  <p>Với đội ngũ kỹ sư giàu kinh nghiệm, CovaSol cung cấp đa dạng dịch vụ:</p>\r\n  <ul>\r\n    <li><strong>Phát triển Web Application:</strong> React, Next.js, Vue.js, Angular</li>\r\n    <li><strong>Mobile App Development:</strong> React Native, Flutter cho iOS & Android</li>\r\n    <li><strong>Backend & API:</strong> Node.js, Python, Java Spring Boot</li>\r\n    <li><strong>AI & Machine Learning:</strong> Chatbot, OCR, Computer Vision</li>\r\n    <li><strong>Cloud Solutions:</strong> AWS, Azure, Google Cloud</li>\r\n    <li><strong>UI/UX Design:</strong> Thiết kế giao diện hiện đại, tập trung trải nghiệm người dùng</li>\r\n  </ul>\r\n\r\n  <h3>🤝 Cam kết của CovaSol</h3>\r\n  <blockquote>\r\n    \"Chúng tôi không chỉ làm phần mềm, chúng tôi kiến tạo giá trị. Mỗi dự án là một cơ hội để chứng minh sự tận tâm và chuyên nghiệp.\"\r\n  </blockquote>\r\n  <p>Với phương châm <strong>\"Technology for Growth\"</strong>, CovaSol cam kết:</p>\r\n  <ul>\r\n    <li>✅ Giao hàng đúng tiến độ, đảm bảo chất lượng</li>\r\n    <li>✅ Hỗ trợ kỹ thuật 24/7</li>\r\n    <li>✅ Bảo hành và bảo trì dài hạn</li>\r\n    <li>✅ Tư vấn giải pháp phù hợp ngân sách</li>\r\n  </ul>\r\n\r\n  <h3>📞 Liên hệ với chúng tôi</h3>\r\n  <p>Bạn đang tìm kiếm đối tác công nghệ cho dự án tiếp theo? Hãy để CovaSol đồng hành cùng bạn. Chúng tôi luôn sẵn sàng lắng nghe và đưa ra giải pháp tối ưu nhất cho doanh nghiệp của bạn.</p>\r\n</article>', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80', 'Kinh doanh', '[\"CovaSol\",\"Giới thiệu\",\"Công ty\",\"Chuyển đổi số\"]', '[\"covasol\",\"công ty phần mềm\",\"chuyển đổi số\",\"software company vietnam\"]', 'CovaSol Team', 'Marketing', '2025-12-09 08:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 15:38:53.000', '2025-12-10 06:55:16.176', NULL, NULL),
(5, 'BLOG-TECH-001', 'ai-agents-xu-huong-phat-trien-phan-mem-2025', 'AI Agents - Tương Lai Của Phát Triển Phần Mềm Năm 2025', 'Từ Copilot đến Autonomous Agents', 'AI Agents đang cách mạng hóa cách chúng ta phát triển phần mềm. Khám phá cách các công ty công nghệ hàng đầu đang tích hợp AI Agents vào workflow và tại sao đây là kỹ năng bắt buộc cho developer năm 2025.', '<article class=\"blog-content\">\r\n  <h2>AI Agents - Cuộc cách mạng tiếp theo trong phát triển phần mềm</h2>\r\n  <p>Năm 2025 đánh dấu sự chuyển đổi mạnh mẽ từ <strong>AI Assistants</strong> (như ChatGPT, GitHub Copilot) sang <strong>AI Agents</strong> - những hệ thống AI có khả năng tự động thực hiện các tác vụ phức tạp một cách độc lập.</p>\r\n\r\n  <h3>🤖 AI Agent là gì?</h3>\r\n  <p>Khác với chatbot truyền thống chỉ trả lời câu hỏi, AI Agent có thể:</p>\r\n  <ul>\r\n    <li><strong>Lập kế hoạch:</strong> Phân tích yêu cầu và chia nhỏ thành các bước thực hiện</li>\r\n    <li><strong>Sử dụng công cụ:</strong> Tương tác với API, database, file system</li>\r\n    <li><strong>Tự sửa lỗi:</strong> Nhận diện và khắc phục lỗi trong quá trình thực hiện</li>\r\n    <li><strong>Ra quyết định:</strong> Lựa chọn phương án tối ưu dựa trên context</li>\r\n  </ul>\r\n\r\n  <h3>📈 Các nền tảng AI Agent phổ biến 2025</h3>\r\n  <table>\r\n    <thead>\r\n      <tr><th>Nền tảng</th><th>Use Case</th><th>Điểm nổi bật</th></tr>\r\n    </thead>\r\n    <tbody>\r\n      <tr><td>OpenAI Agents SDK</td><td>General Purpose</td><td>Tool calling, handoffs, guardrails</td></tr>\r\n      <tr><td>LangGraph</td><td>Complex Workflows</td><td>Stateful, graph-based orchestration</td></tr>\r\n      <tr><td>CrewAI</td><td>Multi-Agent Systems</td><td>Role-based agents collaboration</td></tr>\r\n      <tr><td>AutoGPT</td><td>Autonomous Tasks</td><td>Self-prompting, long-running tasks</td></tr>\r\n      <tr><td>Microsoft Copilot Studio</td><td>Enterprise</td><td>Low-code, integration với M365</td></tr>\r\n    </tbody>\r\n  </table>\r\n\r\n  <h3>💡 Ứng dụng thực tế trong phát triển phần mềm</h3>\r\n  \r\n  <h4>1. Coding Agents</h4>\r\n  <p>GitHub Copilot Workspace, Cursor, Windsurf - các IDE tích hợp AI có thể:</p>\r\n  <ul>\r\n    <li>Tự động implement feature từ issue description</li>\r\n    <li>Refactor code và fix bugs</li>\r\n    <li>Generate tests và documentation</li>\r\n  </ul>\r\n\r\n  <h4>2. DevOps Agents</h4>\r\n  <ul>\r\n    <li>Tự động phát hiện và xử lý incidents</li>\r\n    <li>Optimize infrastructure costs</li>\r\n    <li>Security scanning và patching</li>\r\n  </ul>\r\n\r\n  <h4>3. QA Agents</h4>\r\n  <ul>\r\n    <li>Tự động generate test cases từ requirements</li>\r\n    <li>Visual regression testing</li>\r\n    <li>Performance testing và reporting</li>\r\n  </ul>\r\n\r\n  <h3>🔧 Xây dựng AI Agent với Python</h3>\r\n  <pre><code class=\"language-python\">\r\nfrom openai import OpenAI\r\n\r\nclient = OpenAI()\r\n\r\n# Định nghĩa tools cho agent\r\ntools = [\r\n    {\r\n        \"type\": \"function\",\r\n        \"function\": {\r\n            \"name\": \"search_codebase\",\r\n            \"description\": \"Search for code in the repository\",\r\n            \"parameters\": {\r\n                \"type\": \"object\",\r\n                \"properties\": {\r\n                    \"query\": {\"type\": \"string\"}\r\n                }\r\n            }\r\n        }\r\n    }\r\n]\r\n\r\n# Chạy agent loop\r\nresponse = client.responses.create(\r\n    model=\"gpt-4o\",\r\n    tools=tools,\r\n    input=\"Fix the bug in user authentication\"\r\n)\r\n  </code></pre>\r\n\r\n  <h3>⚠️ Thách thức và lưu ý</h3>\r\n  <ul>\r\n    <li><strong>Hallucination:</strong> Agent có thể tạo ra code hoặc thông tin không chính xác</li>\r\n    <li><strong>Security:</strong> Cần kiểm soát quyền truy cập của agent</li>\r\n    <li><strong>Cost:</strong> API calls có thể tốn kém với task phức tạp</li>\r\n    <li><strong>Debugging:</strong> Khó trace khi agent thực hiện nhiều bước</li>\r\n  </ul>\r\n\r\n  <h3>🚀 Kết luận</h3>\r\n  <p>AI Agents không thay thế developer mà là công cụ khuếch đại năng suất. Các developer nắm vững cách xây dựng và điều khiển AI Agents sẽ có lợi thế cạnh tranh lớn trong năm 2025 và những năm tới.</p>\r\n</article>', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80', 'AI & Tech', '[\"AI Agents\",\"LLM\",\"Automation\",\"OpenAI\"]', '[\"ai agents 2025\",\"autonomous ai\",\"langchain\",\"openai agents\"]', 'Nguyễn Minh Tuấn', 'AI Engineer', '2025-12-09 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 15:38:53.000', '2025-12-09 15:38:53.000', NULL, NULL),
(6, 'BLOG-TECH-002', 'nextjs-15-react-19-huong-dan-migration', 'Next.js 15 & React 19 - Những Thay Đổi Quan Trọng và Hướng Dẫn Migration', 'Server Components, Actions và Performance', 'Next.js 15 kết hợp với React 19 mang đến nhiều cải tiến đột phá: React Compiler, Server Actions ổn định, Partial Prerendering. Hướng dẫn chi tiết cách upgrade từ Next.js 14 và tận dụng các tính năng mới.', '<article class=\"blog-content\">\r\n  <h2>Next.js 15 + React 19: Những thay đổi bạn cần biết</h2>\r\n  <p>Sau gần một năm phát triển, <strong>Next.js 15</strong> đã chính thức ra mắt với nhiều tính năng đột phá. Kết hợp với <strong>React 19</strong>, đây là bản cập nhật lớn nhất kể từ App Router.</p>\r\n\r\n  <h3>🆕 Điểm mới trong Next.js 15</h3>\r\n\r\n  <h4>1. React Compiler (Experimental)</h4>\r\n  <p>Tự động memoize components và hooks, không cần <code>useMemo</code>, <code>useCallback</code> thủ công:</p>\r\n  <pre><code class=\"language-javascript\">\r\n// Trước đây - cần memo thủ công\r\nconst MemoizedComponent = memo(function Component({ data }) {\r\n  const processed = useMemo(() => expensiveCalc(data), [data]);\r\n  return &lt;div&gt;{processed}&lt;/div&gt;;\r\n});\r\n\r\n// React 19 + Compiler - tự động optimize\r\nfunction Component({ data }) {\r\n  const processed = expensiveCalc(data);\r\n  return &lt;div&gt;{processed}&lt;/div&gt;;\r\n}\r\n  </code></pre>\r\n\r\n  <h4>2. Partial Prerendering (PPR)</h4>\r\n  <p>Kết hợp static và dynamic rendering trong cùng một page:</p>\r\n  <pre><code class=\"language-javascript\">\r\n// Static shell được serve ngay lập tức\r\n// Dynamic parts được stream sau\r\nexport default async function ProductPage({ params }) {\r\n  return (\r\n    &lt;div&gt;\r\n      &lt;StaticHeader /&gt;\r\n      &lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;\r\n        &lt;DynamicProductDetails id={params.id} /&gt;\r\n      &lt;/Suspense&gt;\r\n    &lt;/div&gt;\r\n  );\r\n}\r\n  </code></pre>\r\n\r\n  <h4>3. Server Actions ổn định</h4>\r\n  <p>Không còn experimental, sẵn sàng cho production:</p>\r\n  <pre><code class=\"language-javascript\">\r\n// app/actions.ts\r\n\"use server\"\r\n\r\nexport async function createPost(formData: FormData) {\r\n  const title = formData.get(\"title\");\r\n  await db.posts.create({ title });\r\n  revalidatePath(\"/posts\");\r\n}\r\n  </code></pre>\r\n\r\n  <h4>4. Caching mặc định thay đổi</h4>\r\n  <p><strong>Quan trọng:</strong> fetch requests không còn cache mặc định:</p>\r\n  <pre><code class=\"language-javascript\">\r\n// Next.js 14: cached by default\r\n// Next.js 15: no-store by default\r\n\r\n// Cần explicit cache\r\nfetch(url, { cache: \"force-cache\" });\r\n\r\n// Hoặc dùng unstable_cache\r\nimport { unstable_cache } from \"next/cache\";\r\nconst getCachedData = unstable_cache(fetchData, [\"key\"]);\r\n  </code></pre>\r\n\r\n  <h3>⚛️ React 19 Highlights</h3>\r\n\r\n  <h4>1. use() Hook</h4>\r\n  <pre><code class=\"language-javascript\">\r\nimport { use } from \"react\";\r\n\r\nfunction Comments({ commentsPromise }) {\r\n  const comments = use(commentsPromise);\r\n  return comments.map(c => &lt;Comment key={c.id} {...c} /&gt;);\r\n}\r\n  </code></pre>\r\n\r\n  <h4>2. Actions trong Forms</h4>\r\n  <pre><code class=\"language-javascript\">\r\nfunction Form() {\r\n  async function handleSubmit(formData) {\r\n    \"use server\";\r\n    await saveData(formData);\r\n  }\r\n\r\n  return (\r\n    &lt;form action={handleSubmit}&gt;\r\n      &lt;input name=\"email\" /&gt;\r\n      &lt;button type=\"submit\"&gt;Submit&lt;/button&gt;\r\n    &lt;/form&gt;\r\n  );\r\n}\r\n  </code></pre>\r\n\r\n  <h4>3. useOptimistic & useFormStatus</h4>\r\n  <pre><code class=\"language-javascript\">\r\nimport { useOptimistic, useFormStatus } from \"react\";\r\n\r\nfunction SubmitButton() {\r\n  const { pending } = useFormStatus();\r\n  return &lt;button disabled={pending}&gt;{pending ? \"Saving...\" : \"Save\"}&lt;/button&gt;;\r\n}\r\n  </code></pre>\r\n\r\n  <h3>🔄 Hướng dẫn Migration từ Next.js 14</h3>\r\n  <ol>\r\n    <li>Update dependencies:\r\n      <pre><code>npm install next@15 react@19 react-dom@19</code></pre>\r\n    </li>\r\n    <li>Chạy codemod:\r\n      <pre><code>npx @next/codemod@canary upgrade latest</code></pre>\r\n    </li>\r\n    <li>Review caching strategy - thêm explicit cache nếu cần</li>\r\n    <li>Test toàn bộ app, đặc biệt các async components</li>\r\n  </ol>\r\n\r\n  <h3>📊 Performance Benchmarks</h3>\r\n  <table>\r\n    <thead>\r\n      <tr><th>Metric</th><th>Next.js 14</th><th>Next.js 15</th><th>Improvement</th></tr>\r\n    </thead>\r\n    <tbody>\r\n      <tr><td>Cold Start</td><td>350ms</td><td>280ms</td><td>20% faster</td></tr>\r\n      <tr><td>Build Time</td><td>45s</td><td>38s</td><td>15% faster</td></tr>\r\n      <tr><td>Bundle Size</td><td>95KB</td><td>82KB</td><td>14% smaller</td></tr>\r\n    </tbody>\r\n  </table>\r\n\r\n  <h3>🎯 Kết luận</h3>\r\n  <p>Next.js 15 + React 19 là combo mạnh mẽ cho production apps. Với React Compiler và PPR, performance được cải thiện đáng kể mà không cần thay đổi nhiều code. Hãy bắt đầu migrate ngay hôm nay!</p>\r\n</article>', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80', 'Phát triển', '[\"Next.js\",\"React\",\"Frontend\",\"JavaScript\"]', '[\"nextjs 15\",\"react 19\",\"server components\",\"migration guide\"]', 'Trần Hoàng Phúc', 'Senior Frontend Developer', '2025-12-09 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 15:38:53.000', '2025-12-09 15:38:53.000', NULL, NULL),
(7, 'BLOG-TECH-003', 'bao-mat-ung-dung-web-2025-owasp-top-10', 'Bảo Mật Ứng Dụng Web 2025: OWASP Top 10 và Các Biện Pháp Phòng Chống', 'Những lỗ hổng phổ biến nhất và cách khắc phục', 'Bảo mật là ưu tiên hàng đầu trong phát triển phần mềm. Tìm hiểu OWASP Top 10 năm 2025, các lỗ hổng bảo mật phổ biến và hướng dẫn thực hành bảo mật cho developer.', '<article class=\"blog-content\">\r\n  <h2>Bảo mật ứng dụng web - Không thể bỏ qua trong năm 2025</h2>\r\n  <p>Với sự gia tăng của các cuộc tấn công mạng, bảo mật không còn là \"nice-to-have\" mà là yêu cầu bắt buộc. Bài viết này tổng hợp các lỗ hổng phổ biến theo <strong>OWASP Top 10</strong> và cách phòng chống.</p>\r\n\r\n  <h3>🔴 OWASP Top 10 - 2025 Edition</h3>\r\n\r\n  <h4>1. Broken Access Control</h4>\r\n  <p><strong>Vấn đề:</strong> User truy cập được resource không thuộc quyền của họ.</p>\r\n  <pre><code class=\"language-javascript\">\r\n// ❌ Sai - Không kiểm tra ownership\r\napp.get(\"/api/orders/:id\", async (req, res) => {\r\n  const order = await Order.findById(req.params.id);\r\n  res.json(order);\r\n});\r\n\r\n// ✅ Đúng - Kiểm tra user sở hữu order\r\napp.get(\"/api/orders/:id\", async (req, res) => {\r\n  const order = await Order.findOne({\r\n    _id: req.params.id,\r\n    userId: req.user.id  // Chỉ lấy order của user hiện tại\r\n  });\r\n  if (!order) return res.status(404).json({ error: \"Not found\" });\r\n  res.json(order);\r\n});\r\n  </code></pre>\r\n\r\n  <h4>2. Cryptographic Failures</h4>\r\n  <p><strong>Vấn đề:</strong> Lưu trữ password, API key không đúng cách.</p>\r\n  <pre><code class=\"language-javascript\">\r\n// ❌ Sai - Hash yếu\r\nconst hash = crypto.createHash(\"md5\").update(password).digest(\"hex\");\r\n\r\n// ✅ Đúng - Dùng bcrypt với salt\r\nimport bcrypt from \"bcrypt\";\r\nconst hash = await bcrypt.hash(password, 12);\r\nconst isValid = await bcrypt.compare(input, hash);\r\n  </code></pre>\r\n\r\n  <h4>3. Injection (SQL, NoSQL, Command)</h4>\r\n  <pre><code class=\"language-javascript\">\r\n// ❌ SQL Injection vulnerable\r\nconst query = `SELECT * FROM users WHERE email = \"${email}\"`;\r\n\r\n// ✅ Parameterized query\r\nconst [users] = await db.query(\r\n  \"SELECT * FROM users WHERE email = ?\",\r\n  [email]\r\n);\r\n\r\n// ✅ Với Prisma ORM\r\nconst user = await prisma.user.findUnique({\r\n  where: { email }\r\n});\r\n  </code></pre>\r\n\r\n  <h4>4. Insecure Design</h4>\r\n  <p>Thiết kế hệ thống thiếu security mindset từ đầu:</p>\r\n  <ul>\r\n    <li>Không có rate limiting cho login → Brute force</li>\r\n    <li>Password reset không expire → Token reuse</li>\r\n    <li>Không validate file upload → Malware upload</li>\r\n  </ul>\r\n\r\n  <h4>5. Security Misconfiguration</h4>\r\n  <pre><code class=\"language-javascript\">\r\n// next.config.js - Security headers\r\nconst securityHeaders = [\r\n  { key: \"X-Frame-Options\", value: \"DENY\" },\r\n  { key: \"X-Content-Type-Options\", value: \"nosniff\" },\r\n  { key: \"X-XSS-Protection\", value: \"1; mode=block\" },\r\n  { key: \"Referrer-Policy\", value: \"strict-origin-when-cross-origin\" },\r\n  { key: \"Content-Security-Policy\", value: \"default-src \'self\'; ...\" }\r\n];\r\n\r\nmodule.exports = {\r\n  async headers() {\r\n    return [{ source: \"/(.*)\", headers: securityHeaders }];\r\n  }\r\n};\r\n  </code></pre>\r\n\r\n  <h3>🛡️ Checklist bảo mật cho Developer</h3>\r\n\r\n  <h4>Authentication & Authorization</h4>\r\n  <ul>\r\n    <li>✅ Sử dụng JWT với expiration ngắn (15-30 phút)</li>\r\n    <li>✅ Implement refresh token rotation</li>\r\n    <li>✅ MFA cho admin và sensitive operations</li>\r\n    <li>✅ Rate limiting: 5 login attempts / 15 phút</li>\r\n  </ul>\r\n\r\n  <h4>Input Validation</h4>\r\n  <pre><code class=\"language-javascript\">\r\nimport { z } from \"zod\";\r\n\r\nconst UserSchema = z.object({\r\n  email: z.string().email(),\r\n  password: z.string().min(8).max(100),\r\n  age: z.number().min(18).max(120)\r\n});\r\n\r\n// Validate input\r\nconst result = UserSchema.safeParse(req.body);\r\nif (!result.success) {\r\n  return res.status(400).json({ errors: result.error.issues });\r\n}\r\n  </code></pre>\r\n\r\n  <h4>API Security</h4>\r\n  <ul>\r\n    <li>✅ HTTPS only - redirect HTTP → HTTPS</li>\r\n    <li>✅ CORS configuration chặt chẽ</li>\r\n    <li>✅ API versioning</li>\r\n    <li>✅ Request size limit</li>\r\n  </ul>\r\n\r\n  <h3>🔧 Tools bảo mật recommended</h3>\r\n  <table>\r\n    <thead>\r\n      <tr><th>Category</th><th>Tool</th><th>Purpose</th></tr>\r\n    </thead>\r\n    <tbody>\r\n      <tr><td>SAST</td><td>SonarQube, Semgrep</td><td>Static code analysis</td></tr>\r\n      <tr><td>DAST</td><td>OWASP ZAP, Burp Suite</td><td>Dynamic testing</td></tr>\r\n      <tr><td>Dependency</td><td>Snyk, npm audit</td><td>Vulnerable packages</td></tr>\r\n      <tr><td>Secrets</td><td>GitLeaks, TruffleHog</td><td>Leaked credentials</td></tr>\r\n    </tbody>\r\n  </table>\r\n\r\n  <h3>📝 Kết luận</h3>\r\n  <p>Bảo mật là trách nhiệm của mọi developer, không chỉ security team. Hãy áp dụng các best practices từ đầu dự án để tránh các lỗ hổng tốn kém sau này. <strong>\"Security by design, not by chance.\"</strong></p>\r\n</article>', 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&q=80', 'Hướng dẫn', '[\"Security\",\"OWASP\",\"Web Development\",\"Best Practices\"]', '[\"bảo mật web\",\"owasp top 10\",\"web security\",\"secure coding\"]', 'Lê Văn Bảo', 'Security Engineer', '2025-12-09 12:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 15:38:53.000', '2025-12-09 15:38:53.000', NULL, NULL),
(8, 'BLOG-001', 'xu-huong-react-2025', '10 Xu hướng React.js 2025', 'Cập nhật frontend', 'Xu hướng Server Components, Streaming SSR, AI-assisted coding.', 'Nội dung demo về React 2025.', '/assets/img/blog/react-trends.jpg', 'Phát triển', '[\"React\",\"Frontend\"]', '[\"react 2025\",\"server components\"]', 'Nguyễn Văn Minh', 'Senior Developer', '2025-12-01 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-10 06:55:16.176', NULL, NULL),
(9, 'BLOG-002', 'nodejs-performance', 'Tối ưu hiệu suất Node.js', 'Enterprise tips', 'Connection pooling, caching, clustering.', 'Nội dung demo Node.js.', '/assets/img/blog/nodejs-perf.jpg', 'Phát triển', '[\"Node.js\",\"Backend\"]', '[\"node performance\"]', 'Trần Đức Anh', 'Tech Lead', '2025-11-28 09:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(10, 'BLOG-003', 'microservices-guide', 'Microservices Architecture: Hướng dẫn', 'Từ monolith đến microservices', 'Chiến lược chuyển đổi an toàn.', 'Nội dung demo microservices.', '/assets/img/blog/microservices.jpg', 'Phát triển', '[\"Microservices\",\"Architecture\"]', '[\"system design\"]', 'Lê Hoàng Nam', 'Solution Architect', '2025-11-25 14:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(11, 'BLOG-004', 'api-design-2025', 'RESTful API Design best practices', 'Thiết kế API chuẩn', 'Versioning, error handling, rate limit.', 'Nội dung demo API.', '/assets/img/blog/api-design.jpg', 'Phát triển', '[\"API\",\"REST\"]', '[\"api design\"]', 'Phạm Thị Hương', 'Backend Developer', '2025-11-20 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(12, 'BLOG-005', 'ai-trong-dev', 'AI trong phát triển phần mềm', 'Tăng năng suất 40%', 'AI hỗ trợ code, test, doc.', 'Nội dung demo AI-dev.', '/assets/img/blog/ai-dev.jpg', 'AI & Tech', '[\"AI\",\"Automation\"]', '[\"ai coding\"]', 'Võ Minh Tuấn', 'AI Engineer', '2025-12-03 08:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(13, 'BLOG-006', 'chatbot-doanh-nghiep', 'Chatbot AI cho doanh nghiệp', 'Từ ý tưởng đến triển khai', 'Quy trình xây chatbot đa kênh.', 'Nội dung demo chatbot.', '/assets/img/blog/chatbot.jpg', 'AI & Tech', '[\"Chatbot\",\"NLP\"]', '[\"chatbot ai\"]', 'Đặng Thị Lan', 'AI PM', '2025-11-22 15:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(14, 'BLOG-007', 'ml-fintech', 'Machine Learning trong Fintech', 'Credit scoring & fraud', 'Use case ML tài chính.', 'Nội dung demo ML fintech.', '/assets/img/blog/ml-fintech.jpg', 'AI & Tech', '[\"ML\",\"Fintech\"]', '[\"credit scoring\"]', 'Nguyễn Hoàng Phúc', 'Data Scientist', '2025-11-18 10:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(15, 'BLOG-008', 'computer-vision-ung-dung', 'Computer Vision thực chiến', 'Nhận dạng hình ảnh/video', 'Ứng dụng CV trong sản xuất, bán lẻ.', 'Nội dung demo CV.', '/assets/img/blog/computer-vision.jpg', 'AI & Tech', '[\"Computer Vision\"]', '[\"object detection\"]', 'Trần Minh Khôi', 'ML Engineer', '2025-11-15 09:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(16, 'BLOG-009', 'ui-ux-trends-2025', 'UI/UX Trends 2025', 'Thiết kế giao diện', 'Neumorphism, motion, accessibility.', 'Nội dung demo UI/UX.', '/assets/img/blog/uiux-trends.jpg', 'Thiết kế', '[\"UI/UX\",\"Design\"]', '[\"ui ux trends\"]', 'Lê Thị Mai', 'Lead Designer', '2025-12-02 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(17, 'BLOG-010', 'design-system', 'Xây dựng Design System', 'Scalable design', 'Tokens, components, guidelines.', 'Nội dung demo design system.', '/assets/img/blog/design-system.jpg', 'Thiết kế', '[\"Design System\"]', '[\"component library\"]', 'Nguyễn Thị Hà', 'Product Designer', '2025-11-26 14:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(18, 'BLOG-011', 'mobile-first', 'Mobile-First Design', 'Responsive hiệu quả', 'Ưu tiên mobile, tối ưu hiệu năng.', 'Nội dung demo mobile-first.', '/assets/img/blog/mobile-first.jpg', 'Thiết kế', '[\"Mobile\",\"Responsive\"]', '[\"mobile ux\"]', 'Phạm Văn Đức', 'UX Designer', '2025-11-12 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(19, 'BLOG-012', 'chuyen-doi-so-sme', 'Chuyển đổi số cho SME', 'Roadmap thực tế', 'Các bước nhỏ để bắt đầu.', 'Nội dung demo chuyển đổi số.', '/assets/img/blog/digital-transformation.jpg', 'Kinh doanh', '[\"SME\",\"DX\"]', '[\"chuyển đổi số\"]', 'Hoàng Minh Tâm', 'Business Consultant', '2025-11-30 09:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(20, 'BLOG-013', 'roi-phan-mem', 'Tính ROI khi đầu tư phần mềm', 'Đánh giá hiệu quả', 'Cách đo ROI, payback.', 'Nội dung demo ROI.', '/assets/img/blog/roi-software.jpg', 'Kinh doanh', '[\"ROI\",\"Investment\"]', '[\"business case\"]', 'Trần Thị Linh', 'PM', '2025-11-08 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(21, 'BLOG-014', 'saas-vs-custom', 'SaaS vs Custom Software', 'So sánh hai lựa chọn', 'Ưu nhược điểm, khi nào chọn.', 'Nội dung demo SaaS vs Custom.', '/assets/img/blog/saas-custom.jpg', 'Kinh doanh', '[\"SaaS\",\"Custom\"]', '[\"buy vs build\"]', 'Nguyễn Văn Hải', 'Consultant', '2025-11-05 14:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(22, 'BLOG-015', 'docker-tutorial', 'Docker cho người mới', 'Container cơ bản', 'Cài đặt, Dockerfile, Compose.', 'Nội dung demo Docker.', '/assets/img/blog/docker-tutorial.jpg', 'Hướng dẫn', '[\"Docker\",\"DevOps\"]', '[\"docker tutorial\"]', 'Lê Văn Hùng', 'DevOps Engineer', '2025-11-24 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(23, 'BLOG-016', 'nextjs-14-guide', 'Next.js 14 hướng dẫn', 'App Router & RSC', 'Data fetching, server actions.', 'Nội dung demo Next.js.', '/assets/img/blog/nextjs-tutorial.jpg', 'Hướng dẫn', '[\"Next.js\",\"React\"]', '[\"nextjs 14\"]', 'Phạm Minh Tuấn', 'Frontend Dev', '2025-11-19 09:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(24, 'BLOG-017', 'git-workflow-team', 'Git Workflow cho team', 'Branching & review', 'Git Flow, PR, CI/CD.', 'Nội dung demo Git workflow.', '/assets/img/blog/git-workflow.jpg', 'Hướng dẫn', '[\"Git\",\"Team\"]', '[\"git workflow\"]', 'Võ Đình Khoa', 'Senior Dev', '2025-11-14 11:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(25, 'BLOG-018', 'typescript-advanced', 'TypeScript Advanced Patterns', 'Type safety nâng cao', 'Generics, conditional types.', 'Nội dung demo TS.', '/assets/img/blog/typescript-advanced.jpg', 'Hướng dẫn', '[\"TypeScript\"]', '[\"advanced typescript\"]', 'Nguyễn Thành Đạt', 'Senior Dev', '2025-11-10 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(26, 'BLOG-019', 'aws-cost-optimization', 'AWS Cost Optimization', 'Tiết kiệm chi phí', 'Right-sizing, RIs, cleanup.', 'Nội dung demo AWS cost.', '/assets/img/blog/aws-cost.jpg', 'Hướng dẫn', '[\"AWS\",\"Cloud\"]', '[\"cost optimization\"]', 'Đinh Văn Long', 'Cloud Architect', '2025-11-07 09:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(27, 'BLOG-020', 'cybersecurity-basics-2025', 'Cybersecurity Basics cho dev', 'Bảo mật web', 'OWASP Top 10, auth, HTTPS.', 'Nội dung demo security.', '/assets/img/blog/cybersecurity.jpg', 'Hướng dẫn', '[\"Security\"]', '[\"owasp\"]', 'Bùi Quang Minh', 'Security Engineer', '2025-11-03 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:05:15.000', '2025-12-09 16:05:15.000', NULL, NULL),
(268, 'BLOG-0001', 'xu-huong-react-2026', '10 Xu hướng React.js 2025', 'Cập nhật frontend', 'Xu hướng Server Components, Streaming SSR, AI-assisted coding.', 'Nội dung demo về React 2025.', '/assets/img/blog/react-trends.jpg', 'Phát triển', '[\"React\",\"Frontend\"]', '[\"react 2025\",\"server components\"]', 'Nguyễn Văn Minh', 'Senior Developer', '2025-12-01 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-10 06:55:16.176', NULL, NULL),
(269, 'BLOG-0002', 'nodejs--performance', 'Tối ưu hiệu suất Node.js', 'Enterprise tips', 'Connection pooling, caching, clustering.', 'Nội dung demo Node.js.', '/assets/img/blog/nodejs-perf.jpg', 'Phát triển', '[\"Node.js\",\"Backend\"]', '[\"node performance\"]', 'Trần Đức Anh', 'Tech Lead', '2025-11-28 09:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(270, 'BLOG-0003', 'microservices--guide', 'Microservices Architecture: Hướng dẫn', 'Từ monolith đến microservices', 'Chiến lược chuyển đổi an toàn.', 'Nội dung demo microservices.', '/assets/img/blog/microservices.jpg', 'Phát triển', '[\"Microservices\",\"Architecture\"]', '[\"system design\"]', 'Lê Hoàng Nam', 'Solution Architect', '2025-11-25 14:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(271, 'BLOG-0004', 'api-design-2026', 'RESTful API Design best practices', 'Thiết kế API chuẩn', 'Versioning, error handling, rate limit.', 'Nội dung demo API.', '/assets/img/blog/api-design.jpg', 'Phát triển', '[\"API\",\"REST\"]', '[\"api design\"]', 'Phạm Thị Hương', 'Backend Developer', '2025-11-20 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(272, 'BLOG-0005', 'ai-trongdev', 'AI trong phát triển phần mềm', 'Tăng năng suất 40%', 'AI hỗ trợ code, test, doc.', 'Nội dung demo AI-dev.', '/assets/img/blog/ai-dev.jpg', 'AI & Tech', '[\"AI\",\"Automation\"]', '[\"ai coding\"]', 'Võ Minh Tuấn', 'AI Engineer', '2025-12-03 08:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(273, 'BLOG-0006', 'chatbot-cho-doanh-nghiep', 'Chatbot AI cho doanh nghiệp', 'Từ ý tưởng đến triển khai', 'Quy trình xây chatbot đa kênh.', 'Nội dung demo chatbot.', '/assets/img/blog/chatbot.jpg', 'AI & Tech', '[\"Chatbot\",\"NLP\"]', '[\"chatbot ai\"]', 'Đặng Thị Lan', 'AI PM', '2025-11-22 15:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(274, 'BLOG-0007', 'ml--fintech', 'Machine Learning trong Fintech', 'Credit scoring & fraud', 'Use case ML tài chính.', 'Nội dung demo ML fintech.', '/assets/img/blog/ml-fintech.jpg', 'AI & Tech', '[\"ML\",\"Fintech\"]', '[\"credit scoring\"]', 'Nguyễn Hoàng Phúc', 'Data Scientist', '2025-11-18 10:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(275, 'BLOG-0008', 'computer--vision-ung-dung', 'Computer Vision thực chiến', 'Nhận dạng hình ảnh/video', 'Ứng dụng CV trong sản xuất, bán lẻ.', 'Nội dung demo CV.', '/assets/img/blog/computer-vision.jpg', 'AI & Tech', '[\"Computer Vision\"]', '[\"object detection\"]', 'Trần Minh Khôi', 'ML Engineer', '2025-11-15 09:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(276, 'BLOG-0009', 'ui-ux-trends-2026', 'UI/UX Trends 2025', 'Thiết kế giao diện', 'Neumorphism, motion, accessibility.', 'Nội dung demo UI/UX.', '/assets/img/blog/uiux-trends.jpg', 'Thiết kế', '[\"UI/UX\",\"Design\"]', '[\"ui ux trends\"]', 'Lê Thị Mai', 'Lead Designer', '2025-12-02 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(277, 'BLOG-0010', 'designer-system', 'Xây dựng Design System', 'Scalable design', 'Tokens, components, guidelines.', 'Nội dung demo design system.', '/assets/img/blog/design-system.jpg', 'Thiết kế', '[\"Design System\"]', '[\"component library\"]', 'Nguyễn Thị Hà', 'Product Designer', '2025-11-26 14:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(278, 'BLOG-0011', 'mobilefirst', 'Mobile-First Design', 'Responsive hiệu quả', 'Ưu tiên mobile, tối ưu hiệu năng.', 'Nội dung demo mobile-first.', '/assets/img/blog/mobile-first.jpg', 'Thiết kế', '[\"Mobile\",\"Responsive\"]', '[\"mobile ux\"]', 'Phạm Văn Đức', 'UX Designer', '2025-11-12 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(279, 'BLOG-0102', 'chuyen-doi-so-ssme', 'Chuyển đổi số cho SME', 'Roadmap thực tế', 'Các bước nhỏ để bắt đầu.', 'Nội dung demo chuyển đổi số.', '/assets/img/blog/digital-transformation.jpg', 'Kinh doanh', '[\"SME\",\"DX\"]', '[\"chuyển đổi số\"]', 'Hoàng Minh Tâm', 'Business Consultant', '2025-11-30 09:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(280, 'BLOG-0013', 'con-roi-phan-mem', 'Tính ROI khi đầu tư phần mềm', 'Đánh giá hiệu quả', 'Cách đo ROI, payback.', 'Nội dung demo ROI.', '/assets/img/blog/roi-software.jpg', 'Kinh doanh', '[\"ROI\",\"Investment\"]', '[\"business case\"]', 'Trần Thị Linh', 'PM', '2025-11-08 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(281, 'BLOG-0014', 'saas-vsus-custom', 'SaaS vs Custom Software', 'So sánh hai lựa chọn', 'Ưu nhược điểm, khi nào chọn.', 'Nội dung demo SaaS vs Custom.', '/assets/img/blog/saas-custom.jpg', 'Kinh doanh', '[\"SaaS\",\"Custom\"]', '[\"buy vs build\"]', 'Nguyễn Văn Hải', 'Consultant', '2025-11-05 14:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(282, 'BLOG-0015', 'dockernew-tutorial', 'Docker cho người mới', 'Container cơ bản', 'Cài đặt, Dockerfile, Compose.', 'Nội dung demo Docker.', '/assets/img/blog/docker-tutorial.jpg', 'Hướng dẫn', '[\"Docker\",\"DevOps\"]', '[\"docker tutorial\"]', 'Lê Văn Hùng', 'DevOps Engineer', '2025-11-24 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(283, 'BLOG-0016', 'nextjs-15-guide', 'Next.js 14 hướng dẫn', 'App Router & RSC', 'Data fetching, server actions.', 'Nội dung demo Next.js.', '/assets/img/blog/nextjs-tutorial.jpg', 'Hướng dẫn', '[\"Next.js\",\"React\"]', '[\"nextjs 14\"]', 'Phạm Minh Tuấn', 'Frontend Dev', '2025-11-19 09:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(284, 'BLOG-0017', 'giter-workflow-team', 'Git Workflow cho team', 'Branching & review', 'Git Flow, PR, CI/CD.', 'Nội dung demo Git workflow.', '/assets/img/blog/git-workflow.jpg', 'Hướng dẫn', '[\"Git\",\"Team\"]', '[\"git workflow\"]', 'Võ Đình Khoa', 'Senior Dev', '2025-11-14 11:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(285, 'BLOG-0018', 'typescripts-advanced', 'TypeScript Advanced Patterns', 'Type safety nâng cao', 'Generics, conditional types.', 'Nội dung demo TS.', '/assets/img/blog/typescript-advanced.jpg', 'Hướng dẫn', '[\"TypeScript\"]', '[\"advanced typescript\"]', 'Nguyễn Thành Đạt', 'Senior Dev', '2025-11-10 10:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(286, 'BLOG-0019', 'aws-costs-optimization', 'AWS Cost Optimization', 'Tiết kiệm chi phí', 'Right-sizing, RIs, cleanup.', 'Nội dung demo AWS cost.', '/assets/img/blog/aws-cost.jpg', 'Hướng dẫn', '[\"AWS\",\"Cloud\"]', '[\"cost optimization\"]', 'Đinh Văn Long', 'Cloud Architect', '2025-11-07 09:30:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(287, 'BLOG-0020', 'cybersecurity-basic-2026', 'Cybersecurity Basics cho dev', 'Bảo mật web', 'OWASP Top 10, auth, HTTPS.', 'Nội dung demo security.', '/assets/img/blog/cybersecurity.jpg', 'Hướng dẫn', '[\"Security\"]', '[\"owasp\"]', 'Bùi Quang Minh', 'Security Engineer', '2025-11-03 11:00:00.000', 'published', NULL, NULL, NULL, 0, '2025-12-09 16:08:53.000', '2025-12-09 16:08:53.000', NULL, NULL),
(288, 'BLOG-MIZILSAG-E148', 'adawwwww-blog20251210113417', 'chung test', 'aaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaa\n\naaaaaaaaaaaaaa\na\na\na\na\na\na\n\n\na\n\na\na\n', 'https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341162/landing_page_assets/blog/hero/logocova.png', 'aaaaaaaaa', '[\"aaaaaaaaaaaaa\"]', '[\"aaaaaaaaaaaaa\"]', 'aaaaaaaaaa', 'aaaaaaaaaaa', '2025-12-09 17:32:00.000', 'published', '[{\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341195/landing_page_assets/blog/gallery/logo.png\", \"type\": \"inline\", \"position\": 0}, {\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341213/landing_page_assets/blog/inline/logocova.png\", \"type\": \"inline\", \"caption\": \"aaa\", \"position\": 2}, {\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765341243/landing_page_assets/blog/inline/Screenshot_2025-12-05_101133.png\", \"type\": \"inline\", \"caption\": \"aaa\", \"position\": 4}]', 'null', 'null', 0, '2025-12-10 04:34:17.851', '2025-12-10 04:34:51.244', 1, NULL),
(289, 'BLOG-MIZNLXLU-O3V7', 'aaaaaaaaa-blog20251210135422', 'aaaaaaaaaaaaaa', 'aaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'aaaaaaaaaaaaaaaaaaaaaaaaaa', 'https://res.cloudinary.com/dky6wyvnm/image/upload/v1765349145/landing_page_assets/album/logocova.png', 'aaaaaa', '[\"aaaaaaaaaa\"]', '[\"aaaaaaaaaaaaaaa\"]', 'Kế Bảo', 'Biên tập viên', '2025-12-10 06:54:00.000', 'published', 'null', 'null', 'null', 0, '2025-12-10 06:54:22.820', '2025-12-10 07:51:15.020', 5, NULL),
(290, 'BLOG-MIZPN2GR-ON8D', 'chuyen-doi-so-machuyen-doi-so-ma-blog20251210144958', 'chuyển cục cứt', 'chuyển đổi số má', 'chuyển đổi số má', 'chuyển đổi số máchuyển đổi số máchuyển đổi số má\n\nchuyển đổi số máchuyển đổi số máchuyển đổi số máchuyển đổi số má\n', 'https://res.cloudinary.com/dky6wyvnm/image/upload/v1765347692/landing_page_assets/album/Screenshot_2025-12-10_101233.png', 'chuyển đổi số má', '[\"chuyển đổi số má\"]', '[\"chuyển đổi số má\"]', 'Thế Dũng', 'chuyển đổi số má', '2025-12-10 07:50:00.000', 'published', '[{\"url\": \"https://res.cloudinary.com/dky6wyvnm/image/upload/v1765349145/landing_page_assets/album/logocova.png\", \"type\": \"inline\", \"position\": 2}]', 'null', 'null', 1, '2025-12-10 07:51:15.006', '2025-12-10 07:54:03.783', 7, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cookie_consents`
--

CREATE TABLE `cookie_consents` (
  `id` int NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `consented` tinyint(1) NOT NULL DEFAULT '1',
  `preferences` json DEFAULT NULL,
  `consented_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cookie_consents`
--

INSERT INTO `cookie_consents` (`id`, `ip_address`, `user_agent`, `consented`, `preferences`, `consented_at`, `created_at`, `updated_at`) VALUES
(1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 1, NULL, '2025-12-08 09:39:31.161', '2025-12-08 09:39:31.162', '2025-12-08 09:39:31.162'),
(2, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 1, NULL, '2025-12-08 09:39:44.206', '2025-12-08 09:39:44.208', '2025-12-08 09:39:44.208'),
(3, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 1, NULL, '2025-12-09 08:01:38.938', '2025-12-09 08:01:38.940', '2025-12-09 08:01:38.940'),
(4, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 1, NULL, '2025-12-10 04:03:10.001', '2025-12-10 04:03:10.012', '2025-12-10 04:03:10.012');

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
(1, 'Nguyễn Minh Tuấn', 'CEO - TechStart JSC', NULL, 5, 'COVASOL đã giúp chúng tôi xây dựng hệ thống ERP hoàn chỉnh. Đội ngũ rất chuyên nghiệp, giao hàng đúng hẹn và hỗ trợ tận tình sau bàn giao.', '#3F51B5', 'published', 1, '2025-12-08 09:34:47.397', '2025-12-08 09:34:47.397'),
(2, 'Trần Thị Lan', 'Giám đốc Marketing - BeautyShop', NULL, 1, 'Website và app mobile do COVASOL phát triển đã giúp doanh thu online tăng 300%. UI/UX rất đẹp và dễ sử dụng.', '#8BC34A', 'published', 1, '2025-12-08 09:34:47.410', '2025-12-08 09:34:47.410'),
(3, 'Lê Văn Hùng', 'CTO - FinanceCore', NULL, 4.5, 'Hệ thống API và microservice rất ổn định. COVASOL hiểu rõ yêu cầu kỹ thuật và đưa ra giải pháp phù hợp.', '#FF5722', 'published', 0, '2025-12-08 09:34:47.418', '2025-12-08 09:34:47.418'),
(4, 'Phạm Thị Mai', 'Founder - EduTech Vietnam', NULL, 5, 'Nền tảng học trực tuyến được xây dựng rất chuyên nghiệp. Học sinh và giáo viên đều phản hồi tích cực về giao diện và tính năng.', '#F44336', 'published', 1, '2025-12-08 09:34:47.427', '2025-12-08 09:34:47.427'),
(5, 'Hoàng Đức Thánh', 'Giám đốc - Logistics Plus', NULL, 4, 'Hệ thống quản lý vận chuyển giúp tối ưu tuyến đường và giảm 25% chi phí nhiên liệu. Tính năng tracking real-time rất hữu ích.', '#FF9800', 'published', 0, '2025-12-08 09:34:47.437', '2025-12-08 09:34:47.437'),
(6, 'Nguyễn Thị Hương', 'HR Manager - GreenTech Co.', NULL, 4.5, 'App HR quản lý nhân sự rất tiện lợi. Nhân viên có thể chấm công, xin phép và theo dõi lương dễ dàng.', '#FF9800', 'published', 0, '2025-12-08 09:34:47.447', '2025-12-08 09:34:47.447'),
(7, 'Võ Minh Khôi', 'CEO - SmartHome Solutions', NULL, 5, 'Hệ thống IoT và dashboard monitoring hoạt động cực kỳ ổn định. COVASOL có kiến thức sâu về công nghệ mới nhất.', '#009688', 'published', 1, '2025-12-08 09:34:47.460', '2025-12-08 09:34:47.460'),
(9, 'Trịnh Vân Nam', 'Owner - RetailChain VN', NULL, 5, 'Hệ thống POS và quản lý chuỗi cửa hàng hoạt động mượt mà. Báo cáo thống kê chi tiết giúp ra quyết định chính xác.', '#9C27B0', 'published', 0, '2025-12-08 09:34:47.491', '2025-12-08 09:34:47.491'),
(10, 'Lữ Thị Đinh', 'CFO - InvestSmart', NULL, 4, 'Nền tảng fintech được phát triển với tính bảo mật cao. API tích hợp ngân hàng hoạt động ổn định và tuân thủ quy định.', '#9C27B0', 'published', 0, '2025-12-08 09:34:47.518', '2025-12-08 09:34:47.518'),
(11, 'Bùi Hoàng Long', 'CTO - HealthCare Tech', NULL, 4.5, 'Hệ thống quản lý bệnh viện giúp số hoá quy trình khám chữa bệnh. Bác sĩ và bệnh nhân đều hài lòng.', '#795548', 'published', 0, '2025-12-08 09:34:47.544', '2025-12-08 09:34:47.544'),
(12, 'Cao Thị Minh', 'Operations Manager - LogiFlow', NULL, 4, 'Automation workflow tiết kiệm 40% thời gian xử lý đơn hàng. Tích hợp với các hệ thống có sẵn rất mượt.', '#795548', 'published', 0, '2025-12-08 09:34:47.563', '2025-12-08 09:34:47.563'),
(13, 'Đinh Văn Tài', 'Founder - AgriTech Vietnam', NULL, 5, 'Nền tảng nông nghiệp thông minh kết nối nông dân với người tiêu dùng rất hiệu quả. Giao diện dễ dùng cho mọi lứa tuổi.', '#673AB7', 'published', 0, '2025-12-08 09:34:47.569', '2025-12-08 09:34:47.569'),
(14, 'Võ Thị Thu', 'Brand Manager - FashionHub', NULL, 3.5, 'Website thương mại điện tử có thiết kế đẹp mắt. Một số chức năng checkout cần tối ưu thêm để tăng conversion rate.', '#E91E63', 'published', 0, '2025-12-08 09:34:47.576', '2025-12-08 09:34:47.576'),
(15, 'Phan Minh Đức', 'IT Manager - AutoService', NULL, 4.5, 'Hệ thống quản lý garage ô tô với booking online rất tiện lợi. Khách hàng có thể đặt lịch và theo dõi tiến độ sửa chữa.', '#009688', 'published', 0, '2025-12-08 09:34:47.582', '2025-12-08 09:34:47.582'),
(16, 'Đỗ Thị Linh', 'Director - RealEstate Pro', NULL, 4, 'Nền tảng bất động sản có tính năng tìm kiếm thông minh và bản đồ tương tác. Giúp tăng 50% leads chất lượng.', '#03A9F4', 'published', 0, '2025-12-08 09:34:47.589', '2025-12-08 09:34:47.589'),
(17, 'Hà Quang Minh', 'CEO - TravelSmart', NULL, 5, 'App du lịch với AI recommendation rất ấn tượng. Khách hàng có thể lên kế hoạch và đặt trọn bộ chuyến đi chỉ trong vài click.', '#8BC34A', 'published', 0, '2025-12-08 09:34:47.595', '2025-12-08 09:34:47.595'),
(18, 'Ngô Thị Vân', 'Product Manager - SportsTech', NULL, 3.5, 'App thể thao với tracking workout khá tốt. Performance tracking chính xác nhưng UI cần cải thiện để thân thiện hơn.', '#03A9F4', 'published', 0, '2025-12-08 09:34:47.601', '2025-12-08 09:34:47.601'),
(19, 'Lương Văn Khang', 'Technical Lead - CloudFirst', NULL, 4.5, 'Migration từ on-premise lên cloud do COVASOL thực hiện rất chuyên nghiệp. Zero downtime và hiệu năng tăng đáng kể.', '#FF9800', 'published', 0, '2025-12-08 09:34:47.607', '2025-12-08 09:34:47.607'),
(20, 'Trương Thị Hạnh', 'COO - MediaStreaming', NULL, 4, 'Nền tảng streaming video có khả năng scale tốt. Xử lý hàng nghìn user cùng lúc mà không bị lag hay buffering.', '#673AB7', 'published', 0, '2025-12-08 09:34:47.613', '2025-12-08 09:34:47.613');

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
(1, 'PROD-001', 'virtual-assistant', 'Virtual Assistant Platform', 'AI', 'Trợ lý AI đa kênh - Trả lời khách hàng tự động qua web, Zalo OA và Facebook Messenger.', 'Nền tảng trợ lý ảo được thiết kế chuyên biệt cho doanh nghiệp Việt với khả năng hiểu ngôn ngữ tự nhiên và tích hợp hệ thống sẵn có. Bộ workflow builder trực quan giúp đội CSKH tự điều chỉnh kịch bản chỉ trong vài phút.', '/images/products/virtual-assistant.png', '[\"AI\",\"Chatbot\",\"Multi-channel\"]', '[\"Kết nối đa kênh (Web Widget, Facebook, Zalo OA, Hotline)\",\"Hệ thống đào tạo tri thức từ tài liệu nội bộ\",\"Dashboard realtime phân tích hội thoại\"]', 'Dùng thử miễn phí', '/contact', NULL, NULL, NULL, NULL, NULL, 'active', '2025-12-08 09:34:47.367', '2025-12-08 09:34:47.367'),
(2, 'PROD-002', 'manufacturing-mes', 'Manufacturing MES', 'MES', 'Giải pháp điều hành sản xuất - Tối ưu dây chuyền với dashboard thời gian thực.', 'Hệ thống MES tập trung giúp giám sát hiệu suất từng chuyền và đồng bộ dữ liệu với ERP hiện hữu. Giải pháp hỗ trợ cả mô hình on-premise lẫn cloud để phù hợp yêu cầu bảo mật.', '/images/products/mes.png', '[\"MES\",\"Manufacturing\",\"IoT\"]', '[\"Giám sát OEE và downtime realtime\",\"Quản lý lệnh sản xuất và truy xuất nguồn gốc\",\"Ứng dụng di động cho tổ trưởng\"]', 'Đặt lịch demo', '/contact', NULL, NULL, NULL, NULL, NULL, 'active', '2025-12-08 09:34:47.377', '2025-12-08 09:34:47.377'),
(3, 'PROD-003', 'iot-monitoring', 'IoT Monitoring System', 'IoT', 'Hệ thống giám sát IoT - Theo dõi thiết bị và cảm biến với dashboard realtime.', 'Nền tảng IoT cho phép thu thập dữ liệu từ hàng nghìn thiết bị, xử lý realtime và đưa ra cảnh báo thông minh. Tích hợp AI để dự đoán bảo trì và tối ưu vận hành.', '/images/products/iot.png', '[\"IoT\",\"Monitoring\",\"Predictive\"]', '[\"Thu thập dữ liệu từ nhiều loại cảm biến\",\"Dashboard realtime và báo cáo tự động\",\"AI dự đoán bảo trì preventive\"]', 'Liên hệ tư vấn', '/contact', NULL, NULL, NULL, NULL, NULL, 'active', '2025-12-08 09:34:47.384', '2025-12-08 09:34:47.384');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visit_stats`
--

CREATE TABLE `visit_stats` (
  `id` int NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visit_count` int NOT NULL DEFAULT '1',
  `last_visited_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `visit_stats`
--

INSERT INTO `visit_stats` (`id`, `ip_address`, `user_agent`, `visit_count`, `last_visited_at`, `created_at`) VALUES
(1, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 124, '2025-12-10 09:13:50.302', '2025-12-08 09:35:06.308');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('068bb4cd-fc4d-4f60-afb8-f17530447589', '16bf536cdbe80f0db1d16ad7e88339263a743873e1a7f86dc70641e4fdd78f5c', '2025-12-10 06:46:41.249', '20251210064641_add_avatar_and_author_avatar', NULL, NULL, '2025-12-10 06:46:41.142', 1),
('173c4faa-eece-43f7-998a-b2eef23c66ae', 'c5a1adee281c636f1f4ffc1a6eda1473459d9edf07a4cc50dc1a5bedc7216443', '2025-12-10 07:20:48.577', '20251210072048_add_blog_edit_requests', NULL, NULL, '2025-12-10 07:20:48.244', 1),
('2e865c98-ea65-4297-bbbb-ab82cba43c54', '7e6bf8e7234f86e6909b6519f602a736a9198832dcc57fe5dba90c9fddc7d6f0', '2025-12-08 09:34:43.946', '20251208093443_add_visit_and_cookie_consents', NULL, NULL, '2025-12-08 09:34:43.244', 1);

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
-- Indexes for table `blog_edit_requests`
--
ALTER TABLE `blog_edit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_edit_request_blog` (`blog_post_id`),
  ADD KEY `idx_edit_request_requester` (`requester_id`),
  ADD KEY `idx_edit_request_status` (`status`);

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
-- Indexes for table `cookie_consents`
--
ALTER TABLE `cookie_consents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cookie_ip` (`ip_address`),
  ADD KEY `idx_cookie_time` (`consented_at` DESC);

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
-- Indexes for table `visit_stats`
--
ALTER TABLE `visit_stats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_visit_ip` (`ip_address`),
  ADD KEY `idx_visit_ip` (`ip_address`),
  ADD KEY `idx_visit_last` (`last_visited_at` DESC);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `blog_edit_requests`
--
ALTER TABLE `blog_edit_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=291;

--
-- AUTO_INCREMENT for table `cookie_consents`
--
ALTER TABLE `cookie_consents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer_reviews`
--
ALTER TABLE `customer_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `visit_stats`
--
ALTER TABLE `visit_stats`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blog_edit_requests`
--
ALTER TABLE `blog_edit_requests`
  ADD CONSTRAINT `blog_edit_requests_blog_post_id_fkey` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `blog_edit_requests_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `admin_users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
