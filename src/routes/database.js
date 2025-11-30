const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const path = require('path');

const router = express.Router();
const MANAGED_TABLES = ['admin_users', 'blog_posts', 'products'];

// Cấu hình multer để upload file
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
    }
    cb(null, true);
  }
});

// Middleware kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
  }
  next();
};

// Hàm chuyển đổi header từ tiếng Việt sang tiếng Anh
function convertVietnameseToEnglishHeaders(data, type) {
  if (!data || data.length === 0) return data;
  
  const headerMap = createVietnameseHeaders(type);
  const reverseMap = {};
  
  // Tạo map ngược từ tiếng Việt sang tiếng Anh
  Object.keys(headerMap).forEach(eng => {
    reverseMap[headerMap[eng]] = eng;
  });
  
  return data.map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      const englishKey = reverseMap[key] || key;
      newRow[englishKey] = row[key];
    });
    return newRow;
  });
}

// Hàm tạo header tiếng Việt
function createVietnameseHeaders(type) {
  const headers = {
    users: {
      'id': 'ID',
      'username': 'Tên đăng nhập',
      'display_name': 'Tên hiển thị',
      'role': 'Vai trò',
      'created_at': 'Ngày tạo',
      'updated_at': 'Ngày cập nhật'
    },
    blogs: {
      'id': 'ID',
      'code': 'Mã bài viết',
      'slug': 'Đường dẫn',
      'title': 'Tiêu đề',
      'subtitle': 'Phụ đề',
      'excerpt': 'Tóm tắt',
      'content': 'Nội dung',
      'image_url': 'Link hình ảnh',
      'category': 'Danh mục',
      'tags': 'Thẻ tag',
      'keywords': 'Từ khóa',
      'author_name': 'Tên tác giả',
      'author_role': 'Vai trò tác giả',
      'published_at': 'Ngày xuất bản',
      'status': 'Trạng thái',
      'created_at': 'Ngày tạo',
      'updated_at': 'Ngày cập nhật'
    },
    products: {
      'id': 'ID',
      'code': 'Mã sản phẩm',
      'slug': 'Đường dẫn',
      'name': 'Tên sản phẩm',
      'category': 'Danh mục',
      'short_description': 'Mô tả ngắn',
      'description': 'Mô tả chi tiết',
      'image_url': 'Link hình ảnh',
      'feature_tags': 'Tính năng',
      'highlights': 'Điểm nổi bật',
      'cta_primary_label': 'Nhãn CTA chính',
      'cta_primary_url': 'Link CTA chính',
      'cta_secondary_label': 'Nhãn CTA phụ',
      'cta_secondary_url': 'Link CTA phụ',
      'status': 'Trạng thái',
      'created_at': 'Ngày tạo',
      'updated_at': 'Ngày cập nhật'
    }
  };
  return headers[type] || {};
}

// Hàm định dạng worksheet
function formatWorksheet(ws, data, headerMap) {
  if (!ws || !data || data.length === 0) return ws;

  const range = XLSX.utils.decode_range(ws['!ref']);
  
  // Đặt header tiếng Việt
  const originalHeaders = Object.keys(data[0]);
  originalHeaders.forEach((header, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (ws[cellAddress]) {
      ws[cellAddress].v = headerMap[header] || header;
    }
  });

  // Định dạng tất cả các ô
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      const cell = ws[cellAddress];
      
      // Tự động xuống dòng cho nội dung dài
      if (cell.v && typeof cell.v === 'string' && cell.v.length > 50) {
        cell.s = {
          ...cell.s,
          alignment: { 
            wrapText: true, 
            vertical: 'top',
            horizontal: 'left'
          }
        };
      }

      // Định dạng header (hàng đầu tiên)
      if (R === 0) {
        cell.s = {
          ...cell.s,
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '2E7D32' } },
          alignment: { 
            horizontal: 'center',
            vertical: 'center',
            wrapText: true
          },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      } else {
        // Định dạng cho các hàng dữ liệu
        cell.s = {
          ...cell.s,
          border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } }
          },
          alignment: { 
            vertical: 'top',
            wrapText: true
          }
        };

        // Màu nền xen kẽ cho các hàng
        if (R % 2 === 0) {
          cell.s.fill = { fgColor: { rgb: 'F8F9FA' } };
        }

        // Định dạng đặc biệt cho ngày tháng
        const header = originalHeaders[C];
        if (header && (header.includes('_at') || header.includes('date'))) {
          if (cell.v) {
            const date = new Date(cell.v);
            if (!isNaN(date.getTime())) {
              cell.v = date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });
            }
          }
        }
      }
    }
  }

  // Tự động điều chỉnh độ rộng cột
  const colWidths = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxWidth = 10;
    
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[cellAddress] && ws[cellAddress].v) {
        const cellValue = String(ws[cellAddress].v);
        const cellWidth = Math.min(Math.max(cellValue.length, 10), 50);
        maxWidth = Math.max(maxWidth, cellWidth);
      }
    }
    
    colWidths[C] = { wch: maxWidth };
  }
  
  ws['!cols'] = colWidths;
  
  return ws;
}

// Export toàn bộ database sang Excel
router.get('/export', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Lấy dữ liệu từ các bảng
    const users = await db
      .prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users')
      .all();
    const blogs = await db.prepare('SELECT * FROM blog_posts').all();
    const products = await db.prepare('SELECT * FROM products').all();
    
    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    
    // Thêm sheet users với định dạng
    if (users.length > 0) {
      const usersSheet = XLSX.utils.json_to_sheet(users);
      const formattedUsersSheet = formatWorksheet(usersSheet, users, createVietnameseHeaders('users'));
      XLSX.utils.book_append_sheet(wb, formattedUsersSheet, 'Người dùng');
    }
    
    // Thêm sheet blogs với định dạng
    if (blogs.length > 0) {
      const blogsSheet = XLSX.utils.json_to_sheet(blogs);
      const formattedBlogsSheet = formatWorksheet(blogsSheet, blogs, createVietnameseHeaders('blogs'));
      XLSX.utils.book_append_sheet(wb, formattedBlogsSheet, 'Bài viết');
    }
    
    // Thêm sheet products với định dạng
    if (products.length > 0) {
      const productsSheet = XLSX.utils.json_to_sheet(products);
      const formattedProductsSheet = formatWorksheet(productsSheet, products, createVietnameseHeaders('products'));
      XLSX.utils.book_append_sheet(wb, formattedProductsSheet, 'Sản phẩm');
    }
    
    // Thêm sheet thông tin tổng quan
    const summaryData = [
      { 'Bảng': 'Người dùng', 'Số lượng': users.length, 'Mô tả': 'Danh sách tài khoản quản trị' },
      { 'Bảng': 'Bài viết', 'Số lượng': blogs.length, 'Mô tả': 'Danh sách bài viết blog' },
      { 'Bảng': 'Sản phẩm', 'Số lượng': products.length, 'Mô tả': 'Danh sách sản phẩm' },
      { 'Bảng': '', 'Số lượng': '', 'Mô tả': '' },
      { 'Bảng': 'Tổng cộng', 'Số lượng': users.length + blogs.length + products.length, 'Mô tả': 'Tổng số bản ghi' },
      { 'Bảng': '', 'Số lượng': '', 'Mô tả': '' },
      { 'Bảng': 'Xuất lúc', 'Số lượng': new Date().toLocaleString('vi-VN'), 'Mô tả': 'Thời gian tạo file' }
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const formattedSummarySheet = formatWorksheet(summarySheet, summaryData, {
      'Bảng': 'Bảng dữ liệu',
      'Số lượng': 'Số lượng',
      'Mô tả': 'Mô tả'
    });
    XLSX.utils.book_append_sheet(wb, formattedSummarySheet, 'Tổng quan');
    
    // Tạo buffer từ workbook
    const buffer = XLSX.write(wb, { 
      type: 'buffer', 
      bookType: 'xlsx',
      cellStyles: true
    });
    
    // Set headers và gửi file
    const currentDate = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    const filename = `CovaSol_Database_${currentDate}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error exporting database:', err);
    res.status(500).json({ message: 'Không thể export database.' });
  }
});

// Validate cấu trúc file Excel
function validateExcelStructure(workbook) {
  const errors = [];
  
  // Các tên sheet có thể chấp nhận (tiếng Anh và tiếng Việt)
  const acceptableSheetNames = {
    users: ['Users', 'Người dùng', 'users', 'nguoi_dung'],
    blogs: ['Blogs', 'Bài viết', 'blogs', 'bai_viet'],
    products: ['Products', 'Sản phẩm', 'products', 'san_pham']
  };
  
  // Tìm sheet names thực tế
  const actualSheets = {
    users: null,
    blogs: null,
    products: null
  };
  
  for (const sheetName of workbook.SheetNames) {
    if (acceptableSheetNames.users.includes(sheetName)) {
      actualSheets.users = sheetName;
    } else if (acceptableSheetNames.blogs.includes(sheetName)) {
      actualSheets.blogs = sheetName;
    } else if (acceptableSheetNames.products.includes(sheetName)) {
      actualSheets.products = sheetName;
    }
  }
  
  // Kiểm tra các sheet bắt buộc
  if (!actualSheets.users) {
    errors.push(`Thiếu sheet người dùng. Tên sheet phải là một trong: ${acceptableSheetNames.users.join(', ')}`);
  }
  if (!actualSheets.blogs) {
    errors.push(`Thiếu sheet bài viết. Tên sheet phải là một trong: ${acceptableSheetNames.blogs.join(', ')}`);
  }
  if (!actualSheets.products) {
    errors.push(`Thiếu sheet sản phẩm. Tên sheet phải là một trong: ${acceptableSheetNames.products.join(', ')}`);
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Kiểm tra cấu trúc sheet Users
  if (actualSheets.users) {
    const usersSheet = workbook.Sheets[actualSheets.users];
    const usersData = XLSX.utils.sheet_to_json(usersSheet, { header: 1 });
    if (usersData.length > 0) {
      const usersHeaders = usersData[0];
      const requiredUsersHeaders = ['id', 'username', 'display_name', 'role'];
      const vietnameseHeaders = Object.keys(createVietnameseHeaders('users'));
      const allAcceptableHeaders = [...requiredUsersHeaders, ...vietnameseHeaders];
      
      const missingUsersHeaders = requiredUsersHeaders.filter(h => 
        !usersHeaders.some(header => 
          header === h || 
          header === createVietnameseHeaders('users')[h]
        )
      );
      
      if (missingUsersHeaders.length > 0) {
        errors.push(`Sheet "${actualSheets.users}" thiếu các cột bắt buộc: ${missingUsersHeaders.join(', ')}`);
      }
    }
  }
  
  // Kiểm tra cấu trúc sheet Blogs
  if (actualSheets.blogs) {
    const blogsSheet = workbook.Sheets[actualSheets.blogs];
    const blogsData = XLSX.utils.sheet_to_json(blogsSheet, { header: 1 });
    if (blogsData.length > 0) {
      const blogsHeaders = blogsData[0];
      const requiredBlogsHeaders = ['code', 'slug', 'title', 'content', 'published_at'];
      const vietnameseHeaders = Object.keys(createVietnameseHeaders('blogs'));
      
      const missingBlogsHeaders = requiredBlogsHeaders.filter(h => 
        !blogsHeaders.some(header => 
          header === h || 
          header === createVietnameseHeaders('blogs')[h]
        )
      );
      
      if (missingBlogsHeaders.length > 0) {
        errors.push(`Sheet "${actualSheets.blogs}" thiếu các cột bắt buộc: ${missingBlogsHeaders.join(', ')}`);
      }
    }
  }
  
  // Kiểm tra cấu trúc sheet Products
  if (actualSheets.products) {
    const productsSheet = workbook.Sheets[actualSheets.products];
    const productsData = XLSX.utils.sheet_to_json(productsSheet, { header: 1 });
    if (productsData.length > 0) {
      const productsHeaders = productsData[0];
      const requiredProductsHeaders = ['code', 'slug', 'name'];
      const vietnameseHeaders = Object.keys(createVietnameseHeaders('products'));
      
      const missingProductsHeaders = requiredProductsHeaders.filter(h => 
        !productsHeaders.some(header => 
          header === h || 
          header === createVietnameseHeaders('products')[h]
        )
      );
      
      if (missingProductsHeaders.length > 0) {
        errors.push(`Sheet "${actualSheets.products}" thiếu các cột bắt buộc: ${missingProductsHeaders.join(', ')}`);
      }
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true, actualSheets };
}

// Import database từ file Excel
router.post('/import', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file Excel để import.' });
    }
    
    // Đọc file Excel từ buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    
    // Validate cấu trúc file
    const validation = validateExcelStructure(workbook);
    if (!validation.valid) {
      return res.status(400).json({ 
        message: `Sai form file Excel: ${validation.errors.join('; ')}` 
      });
    }
    
    const { actualSheets } = validation;
    
    let stats = { users: 0, blogs: 0, products: 0 };

    await db.transaction(async (tx) => {
      // Import Users
      const usersSheet = workbook.Sheets[actualSheets.users];
      const rawUsersData = XLSX.utils.sheet_to_json(usersSheet);
      const usersData = convertVietnameseToEnglishHeaders(rawUsersData, 'users');

      if (usersData.length > 0) {
        await tx
          .prepare('DELETE FROM admin_users WHERE id != ?')
          .run(req.session.user.id);

        for (const user of usersData) {
          if (user.id === req.session.user.id) {
            continue;
          }

          let passwordHash = user.password_hash;
          if (!passwordHash) {
            passwordHash = bcrypt.hashSync('ChangeMe123!', 12);
          }

          await tx
            .prepare(`
              INSERT INTO admin_users 
              (id, username, password_hash, display_name, role, created_at, updated_at)
              VALUES (@id, @username, @password_hash, @display_name, @role, @created_at, @updated_at)
            `)
            .run({
              id: user.id || null,
              username: user.username,
              password_hash: passwordHash,
              display_name: user.display_name,
              role: user.role || 'admin',
              created_at: user.created_at || new Date().toISOString(),
              updated_at: user.updated_at || new Date().toISOString()
            });
        }
        stats.users = usersData.length;
      }

      // Import Blogs
      const blogsSheet = workbook.Sheets[actualSheets.blogs];
      const rawBlogsData = XLSX.utils.sheet_to_json(blogsSheet);
      const blogsData = convertVietnameseToEnglishHeaders(rawBlogsData, 'blogs');

      if (blogsData.length > 0) {
        await tx.prepare('DELETE FROM blog_posts').run();

        for (const blog of blogsData) {
          await tx
            .prepare(`
              INSERT INTO blog_posts 
              (code, slug, title, subtitle, excerpt, content, image_url, category, tags, keywords, 
               author_name, author_role, published_at, status, created_at, updated_at)
              VALUES (@code, @slug, @title, @subtitle, @excerpt, @content, @image_url, @category, @tags,
                @keywords, @author_name, @author_role, @published_at, @status, @created_at, @updated_at)
            `)
            .run({
              code: blog.code,
              slug: blog.slug,
              title: blog.title,
              subtitle: blog.subtitle || null,
              excerpt: blog.excerpt || null,
              content: blog.content,
              image_url: blog.image_url || null,
              category: blog.category || null,
              tags: blog.tags || null,
              keywords: blog.keywords || null,
              author_name: blog.author_name || null,
              author_role: blog.author_role || null,
              published_at: blog.published_at,
              status: blog.status || 'published',
              created_at: blog.created_at || new Date().toISOString(),
              updated_at: blog.updated_at || new Date().toISOString()
            });
        }
        stats.blogs = blogsData.length;
      }

      // Import Products
      const productsSheet = workbook.Sheets[actualSheets.products];
      const rawProductsData = XLSX.utils.sheet_to_json(productsSheet);
      const productsData = convertVietnameseToEnglishHeaders(rawProductsData, 'products');

      if (productsData.length > 0) {
        await tx.prepare('DELETE FROM products').run();

        for (const product of productsData) {
          await tx
            .prepare(`
              INSERT INTO products 
              (code, slug, name, category, short_description, description, image_url, 
               feature_tags, highlights, cta_primary_label, cta_primary_url, 
               cta_secondary_label, cta_secondary_url, status, created_at, updated_at)
              VALUES (@code, @slug, @name, @category, @short_description, @description, @image_url,
                @feature_tags, @highlights, @cta_primary_label, @cta_primary_url, @cta_secondary_label,
                @cta_secondary_url, @status, @created_at, @updated_at)
            `)
            .run({
              code: product.code,
              slug: product.slug,
              name: product.name,
              category: product.category || null,
              short_description: product.short_description || null,
              description: product.description || null,
              image_url: product.image_url || null,
              feature_tags: product.feature_tags || null,
              highlights: product.highlights || null,
              cta_primary_label: product.cta_primary_label || null,
              cta_primary_url: product.cta_primary_url || null,
              cta_secondary_label: product.cta_secondary_label || null,
              cta_secondary_url: product.cta_secondary_url || null,
              status: product.status || 'active',
              created_at: product.created_at || new Date().toISOString(),
              updated_at: product.updated_at || new Date().toISOString()
            });
        }
        stats.products = productsData.length;
      }
    });

    res.json({
      message: 'Import database thành công.',
      stats
    });
  } catch (err) {
    console.error('Error importing database:', err);
    if (err.message.includes('Chỉ chấp nhận file Excel')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Không thể import database: ' + err.message });
  }
});

// Export template file Excel để người dùng tham khảo
router.get('/template', requireAuth, requireAdmin, (req, res) => {
  try {
    // Tạo workbook mới với dữ liệu mẫu
    const wb = XLSX.utils.book_new();
    
    // Template Users
    const usersTemplate = [
      {
        id: 1,
        username: 'admin',
        display_name: 'Administrator',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        'NOTE': 'Password sẽ được reset về ChangeMe123! nếu không có password_hash'
      }
    ];
    const usersSheet = XLSX.utils.json_to_sheet(usersTemplate);
    const formattedUsersSheet = formatWorksheet(usersSheet, usersTemplate, createVietnameseHeaders('users'));
    XLSX.utils.book_append_sheet(wb, formattedUsersSheet, 'Người dùng');
    
    // Template Blogs
    const blogsTemplate = [
      {
        id: 1,
        code: 'BLOG20240101000000',
        slug: 'bai-viet-mau',
        title: 'Bài viết mẫu - Hướng dẫn sử dụng công nghệ mới',
        subtitle: 'Phụ đề mẫu - Khám phá những tính năng đặc biệt',
        excerpt: 'Tóm tắt ngắn gọn về nội dung bài viết, giúp người đọc hiểu được chủ đề chính',
        content: `Nội dung chi tiết của bài viết bao gồm:
        
1. Giới thiệu về chủ đề
2. Phân tích chi tiết các vấn đề
3. Đưa ra giải pháp cụ thể
4. Kết luận và hướng phát triển

Đây là một ví dụ về nội dung dài có thể xuống nhiều dòng trong Excel.`,
        image_url: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: 'công nghệ,hướng dẫn,tips,tutorial',
        keywords: 'keyword1,keyword2,từ khóa SEO',
        author_name: 'Nguyễn Văn A',
        author_role: 'Content Writer',
        published_at: new Date().toISOString(),
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    const blogsSheet = XLSX.utils.json_to_sheet(blogsTemplate);
    const formattedBlogsSheet = formatWorksheet(blogsSheet, blogsTemplate, createVietnameseHeaders('blogs'));
    XLSX.utils.book_append_sheet(wb, formattedBlogsSheet, 'Bài viết');
    
    // Template Products
    const productsTemplate = [
      {
        id: 1,
        code: 'PROD20240101000000',
        slug: 'san-pham-mau',
        name: 'Sản phẩm mẫu - Giải pháp công nghệ tiên tiến',
        category: 'Software',
        short_description: 'Mô tả ngắn gọn về sản phẩm, tính năng chính và lợi ích mang lại cho khách hàng',
        description: `Mô tả chi tiết về sản phẩm:

• Tính năng chính: Hỗ trợ đa nền tảng
• Ưu điểm: Dễ sử dụng, hiệu suất cao
• Khách hàng mục tiêu: Doanh nghiệp vừa và nhỏ
• Hỗ trợ: 24/7 qua nhiều kênh

Sản phẩm được thiết kế để đáp ứng nhu cầu thực tế của doanh nghiệp hiện đại.`,
        image_url: 'https://example.com/product.jpg',
        feature_tags: 'AI,Machine Learning,Cloud Computing,API',
        highlights: 'Tiết kiệm 50% thời gian|Tăng hiệu suất 200%|Hỗ trợ 24/7|Bảo mật tuyệt đối',
        cta_primary_label: 'Tìm hiểu thêm',
        cta_primary_url: '#',
        cta_secondary_label: 'Liên hệ tư vấn',
        cta_secondary_url: '#contact',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    const productsSheet = XLSX.utils.json_to_sheet(productsTemplate);
    const formattedProductsSheet = formatWorksheet(productsSheet, productsTemplate, createVietnameseHeaders('products'));
    XLSX.utils.book_append_sheet(wb, formattedProductsSheet, 'Sản phẩm');
    
    // Thêm sheet hướng dẫn
    const instructionData = [
      { 'Mục': 'Hướng dẫn sử dụng Template', 'Nội dung': '', 'Ghi chú': '' },
      { 'Mục': '', 'Nội dung': '', 'Ghi chú': '' },
      { 'Mục': '1. Người dùng', 'Nội dung': 'Chỉnh sửa thông tin trong sheet "Người dùng"', 'Ghi chú': 'Password mặc định: ChangeMe123!' },
      { 'Mục': '2. Bài viết', 'Nội dung': 'Thêm/sửa bài viết trong sheet "Bài viết"', 'Ghi chú': 'Nội dung có thể dài, sẽ tự động xuống dòng' },
      { 'Mục': '3. Sản phẩm', 'Nội dung': 'Quản lý sản phẩm trong sheet "Sản phẩm"', 'Ghi chú': 'Highlights phân cách bằng dấu |' },
      { 'Mục': '', 'Nội dung': '', 'Ghi chú': '' },
      { 'Mục': 'Lưu ý quan trọng:', 'Nội dung': '', 'Ghi chú': '' },
      { 'Mục': '• Định dạng ngày', 'Nội dung': 'Sử dụng format ISO: YYYY-MM-DDTHH:mm:ss.sssZ', 'Ghi chú': 'VD: 2024-01-01T12:00:00.000Z' },
      { 'Mục': '• Mã code', 'Nội dung': 'Phải là duy nhất trong từng loại', 'Ghi chú': 'Blog: BLOG..., Product: PROD...' },
      { 'Mục': '• Slug', 'Nội dung': 'Không dấu, không khoảng trắng, dùng dấu gạch ngang', 'Ghi chú': 'VD: bai-viet-mau' },
      { 'Mục': '• Status', 'Nội dung': 'Blog: published/draft, Product: active/inactive', 'Ghi chú': 'Mặc định sẽ là published/active' }
    ];
    
    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    const formattedInstructionSheet = formatWorksheet(instructionSheet, instructionData, {
      'Mục': 'Mục',
      'Nội dung': 'Nội dung',
      'Ghi chú': 'Ghi chú'
    });
    XLSX.utils.book_append_sheet(wb, formattedInstructionSheet, 'Hướng dẫn');
    
    // Tạo buffer từ workbook
    const buffer = XLSX.write(wb, { 
      type: 'buffer', 
      bookType: 'xlsx',
      cellStyles: true
    });
    
    // Set headers và gửi file
    const currentDate = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    res.setHeader('Content-Disposition', `attachment; filename="CovaSol_Template_${currentDate}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating template:', err);
    res.status(500).json({ message: 'Không thể tạo file template.' });
  }
});

// Get database schema information
router.get('/schema', requireAuth, requireAdmin, async (req, res) => {
  try {
    const tables = {};

    for (const tableName of MANAGED_TABLES) {
      // Use SHOW COLUMNS for MySQL/MariaDB
      const columns = await db
        .prepare(`SHOW COLUMNS FROM ${tableName}`)
        .all();

      // Transform MySQL column info to consistent format
      const formattedColumns = columns.map(col => ({
        name: col.Field,
        type: col.Type,
        notnull: col.Null === 'NO',
        dflt_value: col.Default,
        pk: col.Key === 'PRI' ? 1 : 0
      }));

      const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
        .get();

      tables[tableName] = {
        columns: formattedColumns,
        rowCount: Number(countResult?.count || 0)
      };
    }

    res.json({ tables });
  } catch (err) {
    console.error('Error getting schema:', err);
    res.status(500).json({ message: 'Không thể lấy thông tin schema.' });
  }
});

// Get table data with schema
router.get('/table/:tableName', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;

    if (!MANAGED_TABLES.includes(tableName)) {
      return res.status(400).json({ message: 'Tên bảng không hợp lệ.' });
    }

    // Use SHOW COLUMNS for MySQL/MariaDB
    const rawColumns = await db
      .prepare(`SHOW COLUMNS FROM ${tableName}`)
      .all();

    // Transform to consistent format
    const columns = rawColumns.map(col => ({
      name: col.Field,
      type: col.Type,
      notnull: col.Null === 'NO',
      dflt_value: col.Default
    }));

    const countResult = await db
      .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
      .get();

    const selectSql =
      tableName === 'admin_users'
        ? 'SELECT id, username, display_name, role, created_at, updated_at FROM admin_users LIMIT 100'
        : `SELECT * FROM ${tableName} LIMIT 100`;
    const rows = await db.prepare(selectSql).all();

    res.json({
      tableName,
      columns,
      rowCount: Number(countResult?.count || 0),
      rows
    });
  } catch (err) {
    console.error('Error getting table data:', err);
    res.status(500).json({ message: 'Không thể lấy dữ liệu bảng.' });
  }
});

// Export single table to Excel
router.get('/export/:tableName', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;

    if (!MANAGED_TABLES.includes(tableName)) {
      return res.status(400).json({ message: 'Tên bảng không hợp lệ.' });
    }

    let data;
    let headerType;
    let sheetName;

    if (tableName === 'admin_users') {
      data = await db
        .prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users')
        .all();
      headerType = 'users';
      sheetName = 'Người dùng';
    } else if (tableName === 'blog_posts') {
      data = await db.prepare('SELECT * FROM blog_posts').all();
      headerType = 'blogs';
      sheetName = 'Bài viết';
    } else {
      data = await db.prepare('SELECT * FROM products').all();
      headerType = 'products';
      sheetName = 'Sản phẩm';
    }

    const wb = XLSX.utils.book_new();

    if (data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data);
      const formattedWs = formatWorksheet(ws, data, createVietnameseHeaders(headerType));
      XLSX.utils.book_append_sheet(wb, formattedWs, sheetName);
    } else {
      const emptyData = [{}];
      const ws = XLSX.utils.json_to_sheet(emptyData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const infoData = [
      { 'Thông tin': 'Bảng dữ liệu', 'Giá trị': sheetName },
      { 'Thông tin': 'Tên bảng gốc', 'Giá trị': tableName },
      { 'Thông tin': 'Số bản ghi', 'Giá trị': data.length },
      { 'Thông tin': 'Xuất lúc', 'Giá trị': new Date().toLocaleString('vi-VN') },
      { 'Thông tin': '', 'Giá trị': '' },
      { 'Thông tin': 'Hệ thống', 'Giá trị': 'CovaSol Database Management' }
    ];

    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    const formattedInfoSheet = formatWorksheet(infoSheet, infoData, {
      'Thông tin': 'Thông tin',
      'Giá trị': 'Giá trị'
    });
    XLSX.utils.book_append_sheet(wb, formattedInfoSheet, 'Thông tin');

    const buffer = XLSX.write(wb, {
      type: 'buffer',
      bookType: 'xlsx',
      cellStyles: true
    });

    const currentDate = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    const filename = `CovaSol_${sheetName}_${currentDate}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error exporting table:', err);
    res.status(500).json({ message: 'Không thể export bảng.' });
  }
});

// Import single table from Excel
router.post('/import/:tableName', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { tableName } = req.params;

    if (!MANAGED_TABLES.includes(tableName)) {
      return res.status(400).json({ message: 'Tên bảng không hợp lệ.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file Excel để import.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ message: 'File Excel không có dữ liệu.' });
    }

    let imported = 0;

    await db.transaction(async (tx) => {
      if (tableName === 'admin_users') {
        await tx.prepare('DELETE FROM admin_users WHERE id != ?').run(req.session.user.id);

        for (const user of data) {
          if (user.id === req.session.user.id) continue;

          let passwordHash = user.password_hash;
          if (!passwordHash) {
            passwordHash = bcrypt.hashSync('ChangeMe123!', 12);
          }

          await tx
            .prepare(`
              INSERT INTO admin_users 
              (username, password_hash, display_name, role, created_at, updated_at)
              VALUES (@username, @password_hash, @display_name, @role, @created_at, @updated_at)
            `)
            .run({
              username: user.username,
              password_hash: passwordHash,
              display_name: user.display_name,
              role: user.role || 'admin',
              created_at: user.created_at || new Date().toISOString(),
              updated_at: user.updated_at || new Date().toISOString()
            });
          imported++;
        }
      } else if (tableName === 'blog_posts') {
        await tx.prepare('DELETE FROM blog_posts').run();

        for (const blog of data) {
          await tx
            .prepare(`
              INSERT INTO blog_posts 
              (code, slug, title, subtitle, excerpt, content, image_url, category, tags, keywords, 
               author_name, author_role, published_at, status, created_at, updated_at)
              VALUES (@code, @slug, @title, @subtitle, @excerpt, @content, @image_url, @category, @tags,
                @keywords, @author_name, @author_role, @published_at, @status, @created_at, @updated_at)
            `)
            .run({
              code: blog.code,
              slug: blog.slug,
              title: blog.title,
              subtitle: blog.subtitle || null,
              excerpt: blog.excerpt || null,
              content: blog.content,
              image_url: blog.image_url || null,
              category: blog.category || null,
              tags: blog.tags || null,
              keywords: blog.keywords || null,
              author_name: blog.author_name || null,
              author_role: blog.author_role || null,
              published_at: blog.published_at,
              status: blog.status || 'published',
              created_at: blog.created_at || new Date().toISOString(),
              updated_at: blog.updated_at || new Date().toISOString()
            });
          imported++;
        }
      } else if (tableName === 'products') {
        await tx.prepare('DELETE FROM products').run();

        for (const product of data) {
          await tx
            .prepare(`
              INSERT INTO products 
              (code, slug, name, category, short_description, description, image_url, 
               feature_tags, highlights, cta_primary_label, cta_primary_url, 
               cta_secondary_label, cta_secondary_url, status, created_at, updated_at)
              VALUES (@code, @slug, @name, @category, @short_description, @description, @image_url,
                @feature_tags, @highlights, @cta_primary_label, @cta_primary_url, @cta_secondary_label,
                @cta_secondary_url, @status, @created_at, @updated_at)
            `)
            .run({
              code: product.code,
              slug: product.slug,
              name: product.name,
              category: product.category || null,
              short_description: product.short_description || null,
              description: product.description || null,
              image_url: product.image_url || null,
              feature_tags: product.feature_tags || null,
              highlights: product.highlights || null,
              cta_primary_label: product.cta_primary_label || null,
              cta_primary_url: product.cta_primary_url || null,
              cta_secondary_label: product.cta_secondary_label || null,
              cta_secondary_url: product.cta_secondary_url || null,
              status: product.status || 'active',
              created_at: product.created_at || new Date().toISOString(),
              updated_at: product.updated_at || new Date().toISOString()
            });
          imported++;
        }
      }
    });

    res.json({
      message: 'Import thành công.',
      imported
    });
  } catch (err) {
    console.error('Error importing table:', err);
    res.status(500).json({ message: 'Không thể import bảng: ' + err.message });
  }
});

module.exports = router;
