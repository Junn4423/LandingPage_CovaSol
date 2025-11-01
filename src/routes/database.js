const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

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

// Export toàn bộ database sang Excel
router.get('/export', requireAuth, requireAdmin, (req, res) => {
  try {
    // Lấy dữ liệu từ các bảng
    const users = db.prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users').all();
    const blogs = db.prepare('SELECT * FROM blog_posts').all();
    const products = db.prepare('SELECT * FROM products').all();
    
    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    
    // Thêm sheet users
    const usersSheet = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(wb, usersSheet, 'Users');
    
    // Thêm sheet blogs
    const blogsSheet = XLSX.utils.json_to_sheet(blogs);
    XLSX.utils.book_append_sheet(wb, blogsSheet, 'Blogs');
    
    // Thêm sheet products
    const productsSheet = XLSX.utils.json_to_sheet(products);
    XLSX.utils.book_append_sheet(wb, productsSheet, 'Products');
    
    // Tạo buffer từ workbook
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers và gửi file
    const filename = `covasol_database_${new Date().toISOString().slice(0, 10)}.xlsx`;
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
  const requiredSheets = ['Users', 'Blogs', 'Products'];
  
  // Kiểm tra các sheet bắt buộc
  for (const sheetName of requiredSheets) {
    if (!workbook.SheetNames.includes(sheetName)) {
      errors.push(`Thiếu sheet "${sheetName}"`);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Kiểm tra cấu trúc sheet Users
  const usersSheet = workbook.Sheets['Users'];
  const usersData = XLSX.utils.sheet_to_json(usersSheet, { header: 1 });
  if (usersData.length > 0) {
    const usersHeaders = usersData[0];
    const requiredUsersHeaders = ['id', 'username', 'display_name', 'role'];
    const missingUsersHeaders = requiredUsersHeaders.filter(h => !usersHeaders.includes(h));
    if (missingUsersHeaders.length > 0) {
      errors.push(`Sheet "Users" thiếu các cột: ${missingUsersHeaders.join(', ')}`);
    }
  }
  
  // Kiểm tra cấu trúc sheet Blogs
  const blogsSheet = workbook.Sheets['Blogs'];
  const blogsData = XLSX.utils.sheet_to_json(blogsSheet, { header: 1 });
  if (blogsData.length > 0) {
    const blogsHeaders = blogsData[0];
    const requiredBlogsHeaders = ['code', 'slug', 'title', 'content', 'published_at'];
    const missingBlogsHeaders = requiredBlogsHeaders.filter(h => !blogsHeaders.includes(h));
    if (missingBlogsHeaders.length > 0) {
      errors.push(`Sheet "Blogs" thiếu các cột: ${missingBlogsHeaders.join(', ')}`);
    }
  }
  
  // Kiểm tra cấu trúc sheet Products
  const productsSheet = workbook.Sheets['Products'];
  const productsData = XLSX.utils.sheet_to_json(productsSheet, { header: 1 });
  if (productsData.length > 0) {
    const productsHeaders = productsData[0];
    const requiredProductsHeaders = ['code', 'slug', 'name'];
    const missingProductsHeaders = requiredProductsHeaders.filter(h => !productsHeaders.includes(h));
    if (missingProductsHeaders.length > 0) {
      errors.push(`Sheet "Products" thiếu các cột: ${missingProductsHeaders.join(', ')}`);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true };
}

// Import database từ file Excel
router.post('/import', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
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
    
    // Bắt đầu transaction
    db.prepare('BEGIN TRANSACTION').run();
    
    try {
      // Import Users
      const usersSheet = workbook.Sheets['Users'];
      const usersData = XLSX.utils.sheet_to_json(usersSheet);
      
      if (usersData.length > 0) {
        // Xóa users cũ (trừ user hiện tại)
        db.prepare('DELETE FROM admin_users WHERE id != ?').run(req.session.user.id);
        
        for (const user of usersData) {
          // Bỏ qua user hiện tại nếu có trong file
          if (user.id === req.session.user.id) {
            continue;
          }
          
          // Nếu có password_hash thì dùng, không thì tạo password mặc định
          let passwordHash = user.password_hash;
          if (!passwordHash) {
            // Password mặc định: ChangeMe123!
            passwordHash = bcrypt.hashSync('ChangeMe123!', 12);
          }
          
          db.prepare(`
            INSERT OR REPLACE INTO admin_users 
            (id, username, password_hash, display_name, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            user.id || null,
            user.username,
            passwordHash,
            user.display_name,
            user.role || 'admin',
            user.created_at || new Date().toISOString(),
            user.updated_at || new Date().toISOString()
          );
        }
      }
      
      // Import Blogs
      const blogsSheet = workbook.Sheets['Blogs'];
      const blogsData = XLSX.utils.sheet_to_json(blogsSheet);
      
      if (blogsData.length > 0) {
        db.prepare('DELETE FROM blog_posts').run();
        
        for (const blog of blogsData) {
          db.prepare(`
            INSERT INTO blog_posts 
            (id, code, slug, title, subtitle, excerpt, content, image_url, category, tags, keywords, 
             author_name, author_role, published_at, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            blog.id || null,
            blog.code,
            blog.slug,
            blog.title,
            blog.subtitle || null,
            blog.excerpt || null,
            blog.content,
            blog.image_url || null,
            blog.category || null,
            blog.tags || null,
            blog.keywords || null,
            blog.author_name || null,
            blog.author_role || null,
            blog.published_at,
            blog.status || 'published',
            blog.created_at || new Date().toISOString(),
            blog.updated_at || new Date().toISOString()
          );
        }
      }
      
      // Import Products
      const productsSheet = workbook.Sheets['Products'];
      const productsData = XLSX.utils.sheet_to_json(productsSheet);
      
      if (productsData.length > 0) {
        db.prepare('DELETE FROM products').run();
        
        for (const product of productsData) {
          db.prepare(`
            INSERT INTO products 
            (id, code, slug, name, category, short_description, description, image_url, 
             feature_tags, highlights, cta_primary_label, cta_primary_url, 
             cta_secondary_label, cta_secondary_url, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            product.id || null,
            product.code,
            product.slug,
            product.name,
            product.category || null,
            product.short_description || null,
            product.description || null,
            product.image_url || null,
            product.feature_tags || null,
            product.highlights || null,
            product.cta_primary_label || null,
            product.cta_primary_url || null,
            product.cta_secondary_label || null,
            product.cta_secondary_url || null,
            product.status || 'active',
            product.created_at || new Date().toISOString(),
            product.updated_at || new Date().toISOString()
          );
        }
      }
      
      // Commit transaction
      db.prepare('COMMIT').run();
      
      res.json({ 
        message: 'Import database thành công.',
        stats: {
          users: usersData.length,
          blogs: blogsData.length,
          products: productsData.length
        }
      });
    } catch (err) {
      // Rollback nếu có lỗi
      db.prepare('ROLLBACK').run();
      throw err;
    }
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
    XLSX.utils.book_append_sheet(wb, usersSheet, 'Users');
    
    // Template Blogs
    const blogsTemplate = [
      {
        id: 1,
        code: 'BLOG20240101000000',
        slug: 'bai-viet-mau',
        title: 'Bài viết mẫu',
        subtitle: 'Phụ đề mẫu',
        excerpt: 'Tóm tắt ngắn',
        content: 'Nội dung chi tiết của bài viết',
        image_url: 'https://example.com/image.jpg',
        category: 'Technology',
        tags: 'tag1,tag2,tag3',
        keywords: 'keyword1,keyword2',
        author_name: 'Tác giả',
        author_role: 'Writer',
        published_at: new Date().toISOString(),
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    const blogsSheet = XLSX.utils.json_to_sheet(blogsTemplate);
    XLSX.utils.book_append_sheet(wb, blogsSheet, 'Blogs');
    
    // Template Products
    const productsTemplate = [
      {
        id: 1,
        code: 'PROD20240101000000',
        slug: 'san-pham-mau',
        name: 'Sản phẩm mẫu',
        category: 'Software',
        short_description: 'Mô tả ngắn',
        description: 'Mô tả chi tiết',
        image_url: 'https://example.com/product.jpg',
        feature_tags: 'feature1,feature2',
        highlights: 'highlight1|highlight2',
        cta_primary_label: 'Tìm hiểu thêm',
        cta_primary_url: '#',
        cta_secondary_label: 'Liên hệ',
        cta_secondary_url: '#contact',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    const productsSheet = XLSX.utils.json_to_sheet(productsTemplate);
    XLSX.utils.book_append_sheet(wb, productsSheet, 'Products');
    
    // Tạo buffer từ workbook
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers và gửi file
    res.setHeader('Content-Disposition', 'attachment; filename="covasol_database_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating template:', err);
    res.status(500).json({ message: 'Không thể tạo file template.' });
  }
});

module.exports = router;
