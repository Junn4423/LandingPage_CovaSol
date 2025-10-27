# COVASOL Landing Page

> **Core Value. Smart Solutions.**

Landing page hiện đại, sang trọng và chuyên nghiệp cho công ty công nghệ COVASOL.

## 🚀 Tính năng

- **Thiết kế hiện đại**: Giao diện sang trọng, quyền lực với màu sắc thương hiệu đặc trưng
- **Responsive Design**: Tối ưu hoàn hảo trên mọi thiết bị (Desktop, Tablet, Mobile)
- **Animation Effects**: Sử dụng thư viện AOS để tạo hiệu ứng chuyển động mượt mà
- **Performance Optimized**: Tối ưu tốc độ tải và trải nghiệm người dùng
- **SEO Friendly**: Cấu trúc HTML semantic, meta tags đầy đủ
- **Interactive Elements**: Form liên hệ với validation, các hiệu ứng tương tác
- **Accessibility**: Hỗ trợ đầy đủ các tiêu chuẩn tiếp cận

## 🎨 Color Palette

- **Primary Dark**: `#124E66`
- **Primary Green**: `#2E8B57`
- **Primary Blue**: `#1C6E8C`
- **Primary Navy**: `#0D1B2A`
- **Primary Light**: `#E6EBEE`
- **Accent Green**: `#A5B452`

## 📁 Cấu trúc dự án

```
Covasol/
├── index.html              # Trang chủ
├── assets/
│   ├── css/
│   │   └── style.css       # Stylesheet chính
│   └── js/
│       └── script.js       # JavaScript chính
└── README.md              # Tài liệu hướng dẫn
```

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc semantic, accessibility
- **CSS3**: Grid, Flexbox, Custom Properties, Animations
- **Vanilla JavaScript**: ES6+, Modern APIs
- **AOS Library**: Animate On Scroll effects
- **Font Awesome**: Icon library
- **Google Fonts**: Inter & Poppins typefaces

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px
- **Small Mobile**: < 480px

## 🔧 Cài đặt và sử dụng

1. **Clone hoặc tải xuống dự án**
2. **Mở file `index.html` trong trình duyệt**
3. **Hoặc sử dụng Live Server (khuyến nghị)**

### Sử dụng với Live Server (VS Code):

```bash
# Cài đặt Live Server extension trong VS Code
# Sau đó right-click vào index.html và chọn "Open with Live Server"
```

### Hoặc sử dụng Python Simple Server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Truy cập: http://localhost:8000
```

## 🎯 Sections Overview

### 1. Hero Section
- Giới thiệu tổng quan về COVASOL
- Call-to-action buttons
- Animated floating cards
- Particle effects

### 2. Services Overview
- 6 danh mục dịch vụ chính
- Interactive service cards
- Hover effects và animations

### 3. Service Details
- Chi tiết từng dịch vụ cụ thể
- Target customer information
- Professional descriptions

### 4. About Section
- Thông tin về công ty
- Animated statistics counter
- Team image với hover effects

### 5. Why Choose Us
- 6 lý do chọn COVASOL
- Feature highlights
- Icon-based design

### 6. Contact Section
- Form liên hệ với validation
- Thông tin liên hệ đầy đủ
- Social media links
- Interactive form elements

## 📋 Form Features

- **Real-time validation**: Kiểm tra dữ liệu ngay khi nhập
- **Error handling**: Hiển thị lỗi rõ ràng, thân thiện
- **Success feedback**: Thông báo thành công sau khi gửi
- **Responsive design**: Tối ưu trên mọi thiết bị
- **Accessibility**: Hỗ trợ screen readers

## 🎨 Customization

### Thay đổi màu sắc:
```css
:root {
  --primary-dark: #124E66;
  --primary-green: #2E8B57;
  /* Cập nhật các biến CSS khác */
}
```

### Thay đổi fonts:
```css
:root {
  --font-primary: 'YourFont', sans-serif;
  --font-heading: 'YourHeadingFont', sans-serif;
}
```

### Thêm animations:
```html
<!-- Sử dụng AOS attributes -->
<div data-aos="fade-up" data-aos-delay="100">Content</div>
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🔍 SEO Features

- Semantic HTML structure
- Proper heading hierarchy (h1-h6)
- Meta description và keywords
- Open Graph tags
- Schema.org structured data ready
- Image alt attributes
- Internal linking

## 📱 Browser Support

- **Chrome**: 88+ ✅
- **Firefox**: 85+ ✅
- **Safari**: 14+ ✅
- **Edge**: 88+ ✅
- **Mobile browsers**: iOS 12+, Android 8+ ✅

## 🚀 Performance Tips

1. **Optimize images**: Sử dụng WebP format khi có thể
2. **Lazy loading**: Implemented for better performance
3. **Minify assets**: Minify CSS/JS cho production
4. **CDN**: Sử dụng CDN cho external libraries
5. **Caching**: Thiết lập browser caching headers

## 📞 Contact Information

- **Website**: [covasol.top](https://covasol.top)
- **Email**: [covasol.studio@gmail.com](mailto:covasol.studio@gmail.com)
- **Company**: COVASOL Technology Solutions

## 📄 License

© 2025 COVASOL. All rights reserved.

---

**Developed with ❤️ by COVASOL Team**

*Core Value. Smart Solutions.*
## Backend & Database

Trang landing page hi?n c� backend Node.js ph?c v? n?i dung blog v� s?n ph?m t? co s? d? li?u SQLite.

### Thi?t l?p nhanh

```bash
npm install
npm run db:migrate
npm run db:seed
npm start
```

- M�y ch? s? ch?y t?i `http://localhost:3000` m?c d?nh.
- D? li?u du?c luu trong thu m?c `data/` (d?ng commit c�c t?p `.db`).

### T�i kho?n qu?n tr? m?c d?nh

- �u?ng d?n: `http://localhost:3000/admin`
- T�n dang nh?p: `admin`
- M?t kh?u: `ChangeMe123!`

> N�n d?i m?t kh?u b?ng c�ch t?o user m?i ho?c c?p nh?t tr?c ti?p trong co s? d? li?u tru?c khi dua l�n m�i tru?ng th?t.

### C�c script h? tr?

| L?nh | M� t? |
| --- | --- |
| `npm run db:migrate` | T?o b?ng c?n thi?t trong SQLite |
| `npm run db:seed` | Sinh d? li?u m?u (blog, s?n ph?m, admin) |
| `npm start` | Kh?i d?ng server Express ph?c v? website |

### C�c du?ng d?n m?i

- `GET /api/blog` � Danh s�ch b�i vi?t, h? tr? query `limit`, `offset`, `search`, `category`
- `GET /api/blog/:code` � Chi ti?t b�i vi?t theo `code` ho?c `slug`
- `GET /api/products` � Danh s�ch s?n ph?m
- `GET /api/products/:code` � Chi ti?t s?n ph?m
- `POST/PUT/DELETE /api/blog` & `/api/products` � Qu?n tr? (y�u c?u dang nh?p)

Trang `/blog.html`, `/blog/post/:code`, `/products.html` v� `/products/item/:code` t? d?ng t?i d? li?u t? API.

