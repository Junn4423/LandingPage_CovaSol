const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

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

// Lấy danh sách users
router.get('/', requireAuth, requireAdmin, (req, res) => {
  try {
    const users = db
      .prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users ORDER BY created_at DESC')
      .all();
    
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Không thể lấy danh sách người dùng.' });
  }
});

// Lấy thông tin chi tiết một user
router.get('/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const user = db
      .prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users WHERE id = ?')
      .get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Không thể lấy thông tin người dùng.' });
  }
});

// Tạo user mới
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { username, password, displayName, role } = req.body || {};
  
  if (!username || !password || !displayName) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin (username, password, displayName).' });
  }
  
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
  }
  
  // Kiểm tra username đã tồn tại chưa
  const existing = db
    .prepare('SELECT id FROM admin_users WHERE username = ?')
    .get(username);
  
  if (existing) {
    return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
  }
  
  try {
    const passwordHash = bcrypt.hashSync(password, 12);
    const userRole = role || 'admin';
    
    const result = db
      .prepare('INSERT INTO admin_users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)')
      .run(username, passwordHash, displayName, userRole);
    
    const newUser = db
      .prepare('SELECT id, username, display_name, role, created_at FROM admin_users WHERE id = ?')
      .get(result.lastInsertRowid);
    
    res.status(201).json({ message: 'Tạo người dùng thành công.', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Không thể tạo người dùng.' });
  }
});

// Cập nhật user
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const { username, displayName, role, password } = req.body || {};
  const userId = parseInt(req.params.id, 10);
  
  if (!userId) {
    return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
  }
  
  // Không cho phép tự xóa quyền admin của chính mình
  if (userId === req.session.user.id && role && role !== 'admin') {
    return res.status(400).json({ message: 'Bạn không thể thay đổi vai trò của chính mình.' });
  }
  
  const user = db
    .prepare('SELECT id FROM admin_users WHERE id = ?')
    .get(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  }
  
  try {
    const updates = [];
    const params = [];
    
    if (username) {
      // Kiểm tra username mới có bị trùng không
      const existing = db
        .prepare('SELECT id FROM admin_users WHERE username = ? AND id != ?')
        .get(username, userId);
      
      if (existing) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
      }
      
      updates.push('username = ?');
      params.push(username);
    }
    
    if (displayName) {
      updates.push('display_name = ?');
      params.push(displayName);
    }
    
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    
    if (password) {
      if (String(password).length < 8) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
      }
      const passwordHash = bcrypt.hashSync(password, 12);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật.' });
    }
    
    params.push(userId);
    db.prepare(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    
    const updatedUser = db
      .prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users WHERE id = ?')
      .get(userId);
    
    res.json({ message: 'Cập nhật người dùng thành công.', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Không thể cập nhật người dùng.' });
  }
});

// Xóa user
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  if (!userId) {
    return res.status(400).json({ message: 'ID người dùng không hợp lệ.' });
  }
  
  // Không cho phép tự xóa chính mình
  if (userId === req.session.user.id) {
    return res.status(400).json({ message: 'Bạn không thể xóa tài khoản của chính mình.' });
  }
  
  const user = db
    .prepare('SELECT id FROM admin_users WHERE id = ?')
    .get(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  }
  
  try {
    db.prepare('DELETE FROM admin_users WHERE id = ?').run(userId);
    res.json({ message: 'Xóa người dùng thành công.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Không thể xóa người dùng.' });
  }
});

module.exports = router;
