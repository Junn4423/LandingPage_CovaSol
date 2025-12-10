# COVASOL Platform (Next.js + Express)

Full-stack rewrite of the COVASOL landing site with a modern Next.js 14 frontend, an Express + Prisma API surface, and a shared type package. The new architecture separates marketing pages from the admin/CRUD experience while keeping a single source of truth (MySQL via Laragon/phpMyAdmin).

## Stack at a Glance
- **Frontend:** Next.js App Router, React 18, Tailwind CSS, TanStack Query, shared types from `packages/types`
- **Backend:** Express 4, Prisma ORM, MySQL (develop locally with Laragon), JWT auth over HTTP-only cookies
- **Tooling:** TypeScript everywhere, ts-node-dev for the API, concurrently for full-stack dev, ESLint + Prettier

## Prerequisites
- Node.js **18.18+** and npm **9+**
- [Laragon](https://laragon.org/) or any MySQL 8+ server reachable from your host machine
- Recommended: browsers with cookies enabled (Chrome/Edge) to test the admin flows

## Environment Setup
1. Clone and install once:
   ```bash
   git clone https://github.com/Junn4423/LandingPage_CovaSol.git
   cd LandingPage_CovaSol
   npm install
   ```
2. Copy env vars and adjust to your machine:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file (kept at the repo root) with the values you need:

   | Variable | Purpose | Suggested value for Laragon |
   | --- | --- | --- |
   | `NEXT_PUBLIC_API_BASE_URL`, `API_BASE_URL` | URL the frontend will call | `http://localhost:4000` |
   | `PORT` | Express port | `4000` |
   | `CORS_ORIGINS` | Allowed frontend origins (comma separated) | `http://localhost:3000` |
   | `DATABASE_URL` | Prisma connection string | `mysql://root:@127.0.0.1:3306/covasol` |
   | `ADMIN_SEED_PASSWORD` | Password used by the seed script | `CovaSol#2025` (change if needed) |

   > `dotenv` runs inside each workspace, but placing `.env` at the repo root keeps a single source of truth for both apps.

## Database via Laragon/phpMyAdmin
1. Start Laragon and make sure MySQL is running.
2. Using phpMyAdmin (or `mysql` CLI), create a schema named `covasol` with UTF-8 collation.
3. Run migrations and seed the default admin + sample blog/product entries:
   ```bash
   npm run prisma:migrate --workspace apps/backend
   npm run prisma:seed --workspace apps/backend
   ```
   - You can also inspect/update the schema in `apps/backend/prisma/schema.prisma`.
   - The default admin credentials after seeding are `admin / CovaSol#2025` (or the password you set via `ADMIN_SEED_PASSWORD`).

## Local Development Workflow
### 1. Start the API first (cookies depend on it)
```bash
npm run dev:backend
```
- Runs `ts-node-dev` with `tsconfig-paths/register`, so Prisma + shared types resolve correctly.
- Server listens on `http://localhost:4000` (change via `PORT`).
- Health check: `GET http://localhost:4000/health` → `{ status: "ok" }`.

### 2. Start the Next.js frontend
```bash
npm run dev:frontend
```
- Next.js dev server on `http://localhost:3000`.
- All admin requests hit `/v1/*` endpoints with `credentials: include`, so keep both apps on the same host/port combo or update the env vars accordingly.

### 3. Optional: run both simultaneously
```bash
npm run dev
```
(Uses `concurrently` to start both scripts; still ensure the DB is up.)

## Manual QA: Admin Login + CRUD
Follow this sequence whenever you need to verify that `/admin` works end-to-end:
1. Navigate to `http://localhost:3000/admin` in a fresh browser session.
2. Log in with the seeded admin user. On success, two HTTP-only cookies (`cova_token`, `cova_refresh`) should appear for `localhost`.
3. Visit each admin module:
   - **Blog Editor** – create/update/delete posts and confirm the list updates immediately.
   - **Product Editor** – verify feature arrays and metrics persist correctly.
   - **User Management** – create a secondary admin, update their display name/role, then delete them.
4. Refresh the dashboard. The overview cards pull data from `/v1/admin/analytics/overview`; numbers should match your CRUD actions.
5. Log out from the top-right button to ensure cookies clear.

## API Surface (all under `/v1`)
| Area | Method & Path | Notes |
| --- | --- | --- |
| Auth | `POST /auth/login` | Sets cookies for access + refresh tokens |
|  | `POST /auth/logout` | Clears cookies |
|  | `GET /auth/me` | Returns the current admin profile |
| Admin Blog | `GET /admin/blog` | Requires auth; full list |
|  | `POST /admin/blog` | Create blog post |
|  | `PUT /admin/blog/:id` | Update post |
|  | `DELETE /admin/blog/:id` | Remove post |
| Admin Products | `GET /admin/products` | Requires auth |
|  | `POST /admin/products` | Create product |
|  | `PUT /admin/products/:id` | Update product |
|  | `DELETE /admin/products/:id` | Remove product |
| Users | `GET /users` | List admin accounts |
|  | `POST /users` | Create admin |
|  | `PUT /users/:id` | Update admin |
|  | `DELETE /users/:id` | Delete admin (cannot delete yourself) |
| Analytics | `GET /admin/analytics/overview` | Totals for dashboard |
| Public Blog | `GET /blog`, `GET /blog/:slug` | Used by marketing pages |
| Public Products | `GET /products`, `GET /products/:slug` | Used by marketing pages |

## Useful Scripts
| Command | Description |
| --- | --- |
| `npm run dev:backend` | Start Express API with live reload |
| `npm run dev:frontend` | Start Next.js dev server |
| `npm run prisma:migrate --workspace apps/backend` | Apply Prisma migrations |
| `npm run prisma:seed --workspace apps/backend` | Seed default data/users |
| `npm run build` | Build every workspace (Next + API) |
| `npm run lint` / `npm run format` | Consistent linting & formatting across the monorepo |

## Troubleshooting
- **Backend fails to start** → ensure Laragon is running and `DATABASE_URL` is reachable; Prisma will throw `P1001` if MySQL is unreachable.
- **Cookies missing from the browser** → double-check `CORS_ORIGINS` includes the exact protocol + port of your Next.js dev server.
- **Admin page redirects to 404** → we intentionally removed the `/admin → /admin/dashboard` redirect. Access `/admin` directly.
- **Need richer UX (toasts/validation)** → foundations are ready; plug a toast lib (e.g., `sonner`) inside `AppProviders` once the UX direction is finalized.

That’s the current baseline. Backend now boots cleanly, the admin UI can authenticate against `/v1`, and you can iterate on UX polish next.# COVASOL Landing Page

Core Value. Smart Solutions.

Landing page hiện đại, sang trọng và chuyên nghiệp cho công ty công nghệ COVASOL.

Documentation • Demo • Contact

---

## Mục lục

- [Mục lục](#mục-lục)
- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Bảng màu](#bảng-màu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Sử dụng](#sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [API Endpoints](#api-endpoints)
- [Responsive Design](#responsive-design)
- [Scripts](#scripts)
- [Đóng góp](#đóng-góp)
- [Giấy phép](#giấy-phép)
- [Liên hệ](#liên-hệ)

---

## Giới thiệu

COVASOL Landing Page là một trang web hiện đại, sang trọng được thiết kế chuyên nghiệp cho công ty công nghệ COVASOL. Dự án kết hợp giữa thiết kế UI/UX tinh tế với hiệu suất cao, mang đến trải nghiệm người dùng vượt trội.

### Mục tiêu
- Truyền tải giá trị cốt lõi: "Core Value. Smart Solutions."
- Tăng tỷ lệ chuyển đổi: Thiết kế tập trung vào call-to-action
- Xây dựng niềm tin: Hiển thị năng lực và thành tựu của công ty
- Tối ưu SEO: Cấu trúc semantic và meta tags đầy đủ

---

## Tính năng

### Thiết kế & UX
- Giao diện hiện đại: Thiết kế sang trọng với màu sắc thương hiệu đặc trưng
- Responsive Design: Tối ưu hoàn hảo trên mọi thiết bị (Desktop, Tablet, Mobile)
- Animation Effects: Sử dụng thư viện AOS để tạo hiệu ứng chuyển động mượt mà
- Performance Optimized: Tối ưu tốc độ tải và trải nghiệm người dùng

### Chức năng
- Quản trị nội dung: Hệ thống admin để quản lý blog và sản phẩm
- Phân trang thông minh: Hiển thị nội dung theo trang với pagination
- Tìm kiếm & lọc: Tìm kiếm nâng cao và lọc theo danh mục
- Form liên hệ: Validation đầy đủ với xử lý lỗi

### SEO & Analytics
- SEO Friendly: Cấu trúc HTML semantic, meta tags đầy đủ
- Performance Monitoring: Lighthouse integration
- Accessibility: Hỗ trợ đầy đủ các tiêu chuẩn tiếp cận WCAG

---

## Bảng màu

| Màu | Hex | RGB | Sử dụng |
|-----|-----|-----|---------|
| **Primary Dark** | `#124E66` | `18, 78, 102` | Background chính, headings |
| **Primary Green** | `#2E8B57` | `46, 139, 87` | Accent, buttons chính |
| **Primary Blue** | `#1C6E8C` | `28, 110, 140` | Links, navigation |
| **Primary Navy** | `#0D1B2A` | `13, 27, 42` | Footer, dark sections |
| **Primary Light** | `#E6EBEE` | `230, 235, 238` | Background phụ, cards |

---

## Công nghệ sử dụng

### Frontend
- **HTML5**: Cấu trúc semantic, accessibility
- **CSS3**: Grid, Flexbox, Custom Properties, Animations
- **Vanilla JavaScript**: ES6+, Modern APIs
- **AOS Library**: Animate On Scroll effects
- **Font Awesome**: Icon library
- **Google Fonts**: Inter & Poppins typefaces

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MySQL/MariaDB**: Primary database (with mysql2 driver)
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **express-mysql-session**: MySQL session store
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing

### Development Tools
- **Laragon**: Local development environment (Windows)
- **Nodemon**: Auto-restart development server
- **CleanCSS**: CSS minification
- **UglifyJS**: JavaScript minification
- **HTML Validate**: HTML validation

---

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 18.0+ (khuyến nghị 20+)
- **npm**: Đi kèm với Node.js
- **MySQL/MariaDB**: Phiên bản 8+ (hoặc Laragon, Docker)
- **Trình duyệt**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Cài đặt

### Cách 1: Sử dụng Laragon (Khuyến nghị cho Windows)

1. **Cài đặt Laragon**: Tải từ [laragon.org](https://laragon.org/download/)

2. **Clone repository**:
```bash
git clone https://github.com/Junn4423/LandingPage_CovaSol.git
cd LandingPage_CovaSol
```

3. **Khởi động Laragon**: Mở Laragon và nhấn "Start All"

4. **Tạo database**:
   - Mở phpMyAdmin (http://localhost/phpmyadmin)
   - Tạo database mới tên: `covasol`
   - Chọn database `covasol`
   - Vào tab SQL, paste nội dung file `database/schema.sql` và nhấn Go

5. **Cấu hình môi trường**:
```bash
# Copy file mẫu
copy .env.example .env

# Laragon mặc định: không cần sửa gì (root, không password)
```

6. **Cài đặt dependencies và chạy**:
```bash
npm install
npm run dev
```

API Server sẽ chạy tại: `http://localhost:3001`

### Cách 2: Sử dụng Docker

```bash
# Clone repository
git clone https://github.com/Junn4423/LandingPage_CovaSol.git
cd LandingPage_CovaSol

# Copy file cấu hình môi trường
cp .env.example .env

# Chỉnh sửa .env theo nhu cầu (thay đổi SESSION_SECRET, DB_PASSWORD, etc.)

# Khởi động toàn bộ stack với Docker
docker compose up -d

# API sẽ chạy tại http://localhost:3001
# MariaDB chạy tại localhost:3306
```

### Cách 3: Cài đặt thủ công

#### 1. Clone repository
```bash
git clone https://github.com/Junn4423/LandingPage_CovaSol.git
cd LandingPage_CovaSol
```

#### 2. Cài đặt MySQL/MariaDB
```sql
-- Đăng nhập vào MySQL và tạo database
CREATE DATABASE covasol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user (optional)
CREATE USER 'covasol'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON covasol.* TO 'covasol'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. Cấu hình môi trường
```bash
cp .env.example .env
# Chỉnh sửa DB_HOST, DB_USER, DB_PASSWORD, DB_NAME trong .env
```

#### 4. Cài đặt dependencies
```bash
npm install
```

#### 5. Khởi tạo database
```bash
npm run db:migrate
npm run db:seed
```

#### 6. Khởi động server
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

API Server sẽ chạy tại: `http://localhost:3001`

---

## Triển khai

- Toàn bộ checklist triển khai production (PM2, reverse proxy, backup, biến môi trường) nằm trong [`DEPLOYMENT.md`](DEPLOYMENT.md).
- File mẫu [`.env.example`](.env.example) đã sẵn sàng để bạn sao chép và cấu hình bí mật trước khi khởi chạy.

---

## Sử dụng

### Truy cập trang web
- **Trang chủ**: `http://localhost:3000`
- **Sản phẩm**: `http://localhost:3000/products`
- **Blog**: `http://localhost:3000/blog`
- **Admin**: `http://localhost:3000/admin`

### Tài khoản admin mặc định
- **Username**: `admin`
- **Password**: `ChangeMe123!`

⚠️ **Quan trọng**: Hãy thay đổi mật khẩu admin ngay sau lần đầu đăng nhập!

### Chế độ static (không cần server)
```bash
npm run static
```
Truy cập tại: `http://localhost:8000`

### Thêm combo ảnh demo cho sản phẩm
1. Mở `live-product-editor.html` hoặc tab "Sản phẩm" trong admin, chọn (hoặc tạo) sản phẩm cần chỉnh.
2. Trong khối "Combo ảnh demo", nhấn **Thêm ảnh demo** để tạo một ô mới.
3. Chỉ dán URL ảnh đang được host (VD: CDN, Google Drive đã bật chia sẻ công khai, hoặc ảnh trong thư mục `assets/img`). Hệ thống không hỗ trợ upload trực tiếp từ máy.
4. (Tuỳ chọn) Nhập chú thích để hiển thị trong lớp phủ animation demo.
5. Lưu sản phẩm. Các ảnh này sẽ được dùng để dựng animation combo trên trang sản phẩm.

---

## Cấu trúc dự án

```
Covasol/
├── index              # Trang chủ
├── products           # Trang danh sách sản phẩm
├── product-detail     # Trang chi tiết sản phẩm
├── blog               # Trang danh sách blog
├── blog-detail        # Trang chi tiết blog
├── admin              # Trang quản trị
├── assets/
│   ├── css/
│   │   └── style.css       # Stylesheet chính
│   └── js/
│       ├── script.js       # JavaScript chính
│       ├── admin.js        # Logic admin panel
│       ├── data-service.js # API client
│       └── translations.js # Đa ngôn ngữ
├── src/
│   ├── server.js           # Express server
│   ├── config.js           # Cấu hình ứng dụng
│   ├── db/
│   │   ├── index.js        # Database utilities
│   │   ├── migrate.js      # Database migrations
│   │   └── seed.js         # Database seeding
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── blog.js         # Blog API routes
│   │   └── products.js     # Product API routes
│   └── middleware/
│       └── auth.js         # Authentication middleware
├── data/                   # Database files (auto-generated)
├── node_modules/           # Dependencies (auto-generated)
├── package.json            # Project configuration
└── README.md              # Documentation
```

---

## API Endpoints

### Authentication
```
POST /api/auth/login     # Đăng nhập
POST /api/auth/logout    # Đăng xuất
```

### Blog Management
```
GET  /api/blog           # Lấy danh sách blog
GET  /api/blog/:code     # Lấy chi tiết blog
POST /api/blog           # Tạo blog mới
PUT  /api/blog/:code     # Cập nhật blog
DELETE /api/blog/:code   # Xóa blog
```

### Product Management
```
GET  /api/products       # Lấy danh sách sản phẩm
GET  /api/products/:code # Lấy chi tiết sản phẩm
POST /api/products       # Tạo sản phẩm mới
PUT  /api/products/:code # Cập nhật sản phẩm
DELETE /api/products/:code # Xóa sản phẩm
```

### Query Parameters
- `limit`: Số lượng items per page
- `offset`: Vị trí bắt đầu
- `search`: Từ khóa tìm kiếm
- `tag`: Lọc theo tag

---

## Responsive Design

| Breakpoint | Device | Grid Columns | Container Width |
|------------|--------|--------------|-----------------|
| `> 1024px` | Desktop | 12 | 1200px |
| `768px - 1024px` | Tablet | 8 | 768px |
| `480px - 768px` | Mobile | 4 | 100% |
| `< 480px` | Small Mobile | 2 | 100% |

---

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm start` | Khởi động production server |
| `npm run dev` | Khởi động development server với auto-restart |
| `npm run static` | Chạy static server trên port 8000 |
| `npm run db:migrate` | Tạo cấu trúc database |
| `npm run db:seed` | Thêm dữ liệu mẫu |
| `npm run build` | Minify CSS và JS cho production |
| `npm run validate` | Validate HTML |
| `npm run lighthouse` | Chạy Lighthouse audit |

---

## Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Quy tắc đóng góp
- Tuân thủ coding standards
- Viết commit messages rõ ràng
- Test kỹ trước khi submit
- Cập nhật documentation nếu cần

---

## Giấy phép

Dự án này sử dụng giấy phép **UNLICENSED** - chỉ dành cho mục đích nội bộ của COVASOL.

---

## Liên hệ

**COVASOL Technology Solutions**

- **Website**: [https://covasol.com.vn](https://covasol.com.vn)
- **Email**: [covasol.studio@gmail.com](mailto:covasol.studio@gmail.com)
- **GitHub**: [https://github.com/Junn4423](https://github.com/Junn4423)

### Đội ngũ phát triển
- **Project Lead**: COVASOL Team
- **Design**: UI/UX Team
- **Development**: Full-stack Team

---

Made with love by COVASOL Team

If you like this project, please give us a star!</content>
<parameter name="filePath">c:\NgocChungIT\Chung\Covasol\README.md

