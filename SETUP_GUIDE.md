# COVASOL Platform - Next.js + Node.js + MySQL

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    COVASOL Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────────┐       │
│  │   Next.js 14    │  REST   │   Express.js API    │       │
│  │   Frontend      │ ◄─────► │   Backend           │       │
│  │   (port 3000)   │   API   │   (port 4000)       │       │
│  └─────────────────┘         └──────────┬──────────┘       │
│                                         │                   │
│                                         │ Prisma ORM        │
│                                         │                   │
│                              ┌──────────▼──────────┐       │
│                              │   MySQL Database    │       │
│                              │   (Laragon/XAMPP)   │       │
│                              │   PHPMyAdmin        │       │
│                              └─────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Cấu trúc thư mục

```
LandingPage_CovaSol/
├── apps/
│   ├── frontend/          # Next.js 14 App Router
│   │   ├── app/           # Pages & Routes
│   │   │   ├── (admin)/   # Admin panel routes
│   │   │   ├── blog/      # Blog pages
│   │   │   └── products/  # Product pages
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── lib/       # API clients & utilities
│   │
│   └── backend/           # Express.js + Prisma
│       ├── prisma/        # Database schema & migrations
│       │   └── schema.prisma
│       └── src/
│           ├── routes/    # API endpoints
│           ├── services/  # Business logic
│           ├── middleware/
│           └── db/        # Prisma client
│
├── packages/
│   └── types/             # Shared TypeScript types
│
└── database/
    └── schema.sql         # MySQL schema (backup)
```

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống

- Node.js 18+ 
- MySQL 8.0+ (Laragon / XAMPP / PHPMyAdmin)
- pnpm / npm / yarn

### 2. Cài đặt dependencies

```bash
# Từ thư mục gốc
npm install

# Hoặc cài riêng từng app
cd apps/backend && npm install
cd apps/frontend && npm install
```

### 3. Cấu hình Database (MySQL)

#### Sử dụng Laragon:
1. Mở Laragon và Start All
2. Vào phpMyAdmin: http://localhost/phpmyadmin
3. Tạo database mới: `covasol`
4. (Tùy chọn) Import file `database/schema.sql`

#### Cấu hình .env:

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL="mysql://root:@localhost:3306/covasol"
PORT=4000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`apps/frontend/.env.local`):
```env
API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 4. Khởi tạo Database với Prisma

```bash
cd apps/backend

# Tạo database schema
npx prisma migrate dev --name init

# Seed dữ liệu mẫu
npx prisma db seed

# Mở Prisma Studio (xem database)
npx prisma studio
```

### 5. Chạy Development Server

```bash
# Terminal 1 - Backend API
cd apps/backend
npm run dev
# API chạy tại: http://localhost:4000

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
# Web chạy tại: http://localhost:3000
```

## 📡 API Endpoints

### Public APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/v1/blog` | Danh sách bài viết đã xuất bản |
| GET | `/v1/blog/:slug` | Chi tiết bài viết |
| GET | `/v1/products` | Danh sách sản phẩm |
| GET | `/v1/products/:id` | Chi tiết sản phẩm |

### Auth APIs

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/v1/auth/login` | Đăng nhập admin |
| POST | `/v1/auth/logout` | Đăng xuất |
| GET | `/v1/auth/me` | Thông tin user hiện tại |

### Admin APIs (Yêu cầu authentication)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/v1/admin/blog` | Tất cả bài viết |
| POST | `/v1/admin/blog` | Tạo bài viết mới |
| PUT | `/v1/admin/blog/:id` | Cập nhật bài viết |
| DELETE | `/v1/admin/blog/:id` | Xoá bài viết |
| GET | `/v1/admin/products` | Tất cả sản phẩm |
| POST | `/v1/admin/products` | Tạo sản phẩm mới |
| PUT | `/v1/admin/products/:id` | Cập nhật sản phẩm |
| DELETE | `/v1/admin/products/:id` | Xoá sản phẩm |
| GET | `/v1/admin/analytics/overview` | Thống kê tổng quan |

## 🔐 Tài khoản Admin mặc định

```
Username: admin
Password: CovaSol#2025
```

⚠️ **Lưu ý**: Hãy đổi mật khẩu sau khi triển khai production!

## 🛠️ Công nghệ sử dụng

### Frontend
- **Next.js 14** - React Framework với App Router
- **React Query** - Data fetching & caching
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Zod** - Validation

### Backend  
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### Database
- **MySQL 8.0+** với Laragon/XAMPP
- **PHPMyAdmin** - GUI quản lý database
- **Prisma Migrate** - Database migrations

## 📦 Scripts

### Backend
```bash
npm run dev          # Development với hot-reload
npm run build        # Build production
npm run start        # Chạy production
npm run prisma:migrate  # Chạy migration
npm run prisma:seed     # Seed dữ liệu
npm run prisma:studio   # Mở Prisma Studio
```

### Frontend
```bash
npm run dev          # Development
npm run build        # Build production
npm run start        # Chạy production
npm run lint         # Lint code
```

## 🔄 Quy trình phát triển

1. **Thêm Model mới**: Chỉnh sửa `apps/backend/prisma/schema.prisma`
2. **Migrate**: `npx prisma migrate dev --name <tên_migration>`
3. **Tạo Service**: `apps/backend/src/services/`
4. **Tạo Route**: `apps/backend/src/routes/`
5. **Frontend API**: `apps/frontend/src/lib/api/`
6. **Component**: `apps/frontend/src/components/`

## 🌐 Triển khai Production

### Backend (VPS/Docker)
```bash
cd apps/backend
npm run build
npm start
```

### Frontend (Vercel/Docker)
```bash
cd apps/frontend
npm run build
npm start
```

### Docker
```bash
docker-compose up -d
```

## 📞 Liên hệ

- **Email**: covasol.studio@gmail.com
- **Website**: https://covasol.top
- **Facebook**: https://facebook.com/covasol

---
© 2025 COVASOL Technology Solutions. All rights reserved.
