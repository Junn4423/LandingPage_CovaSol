# COVASOL - Hướng dẫn Setup Database

## 1. Yêu cầu

- Laragon / XAMPP đang chạy
- MySQL Server đang chạy
- Database `covasol` đã được tạo trong PHPMyAdmin

## 2. Setup nhanh

### Bước 1: Tạo database trong PHPMyAdmin

1. Mở http://localhost/phpmyadmin
2. Click "New" để tạo database mới
3. Đặt tên: `covasol`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

### Bước 2: Chạy migration với Prisma

```powershell
# Di chuyển vào thư mục backend
cd apps/backend

# Generate Prisma Client
npx prisma generate

# Chạy migration để tạo tables
npx prisma db push

# Seed dữ liệu mẫu
npx prisma db seed
```

### Bước 3: Kiểm tra database

```powershell
# Mở Prisma Studio để xem dữ liệu
npx prisma studio
```

## 3. Cấu hình đã sẵn sàng

### File .env (apps/backend/.env)
```env
DATABASE_URL="mysql://root:@localhost:3306/covasol"
PORT=4000
JWT_SECRET=covasol-jwt-secret-key-2025-super-secure-change-in-production
```

### File .env.local (apps/frontend/.env.local)
```env
API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## 4. Tài khoản Admin

- **Username:** admin
- **Password:** 04042003Cova*

## 5. Chạy dự án

```powershell
# Từ thư mục gốc, chạy cả backend và frontend
npm run dev

# Hoặc chạy riêng:
# Terminal 1 - Backend
cd apps/backend && npm run dev

# Terminal 2 - Frontend  
cd apps/frontend && npm run dev
```

## 6. URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Admin Panel:** http://localhost:3000/admin
- **PHPMyAdmin:** http://localhost/phpmyadmin
- **Prisma Studio:** http://localhost:5555 (sau khi chạy `npx prisma studio`)
