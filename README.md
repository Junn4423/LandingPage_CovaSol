# COVASOL Landing Page

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
- **SQLite**: Database với better-sqlite3
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **Helmet**: Security headers

### Development Tools
- **Nodemon**: Auto-restart development server
- **CleanCSS**: CSS minification
- **UglifyJS**: JavaScript minification
- **HTML Validate**: HTML validation

---

## Yêu cầu hệ thống

- **Node.js**: Phiên bản 14.0+ (khuyến nghị 18+)
- **npm**: Đi kèm với Node.js
- **SQLite**: Tự động tạo database file
- **Trình duyệt**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Cài đặt

### 1. Clone repository
```bash
git clone https://github.com/Junn4423/LandingPage_CovaSol.git
cd LandingPage_CovaSol
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Khởi tạo database
```bash
# Tạo cấu trúc database
npm run db:migrate

# Thêm dữ liệu mẫu
npm run db:seed
```

### 4. Khởi động server
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

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

- **Website**: [https://covasol.top](https://covasol.top)
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

