const express = require('express');
const { userService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');
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
router.get('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({ users });
}));

// Lấy thông tin chi tiết một user
router.get('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const user = await userService.getUserById(parseInt(req.params.id, 10));
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
  }
  res.json({ user });
}));

// Tạo user mới
router.post('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { username, password, displayName, role } = req.body || {};
  const result = await userService.createUser({ username, password, displayName, role });
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(201).json({ message: 'Tạo người dùng thành công.', user: result.user });
}));

// Cập nhật user
router.put('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { username, displayName, role, password } = req.body || {};
  
  const result = await userService.updateUser(
    userId,
    { username, displayName, role, password },
    req.session.user.id
  );
  
  if (!result.success) {
    const statusCode = result.message.includes('không tìm thấy') ? 404 : 400;
    return res.status(statusCode).json({ message: result.message });
  }
  
  res.json({ message: 'Cập nhật người dùng thành công.', user: result.user });
}));

// Xóa user
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const result = await userService.deleteUser(userId, req.session.user.id);
  
  if (!result.success) {
    const statusCode = result.message.includes('không tìm thấy') ? 404 : 400;
    return res.status(statusCode).json({ message: result.message });
  }
  
  res.json({ message: result.message });
}));

module.exports = router;
