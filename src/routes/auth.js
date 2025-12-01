const express = require('express');
const { authService } = require('../services');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const result = await authService.authenticate(username, password);

  if (!result.success) {
    return res.status(401).json({ message: result.message });
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ message: 'Không thể tạo phiên đăng nhập mới.' });
    }
    req.session.user = result.user;
    res.json({
      message: 'Đăng nhập thành công.',
      user: req.session.user
    });
  });
}));

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Không thể đăng xuất. Vui lòng thử lại.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Đăng xuất thành công.' });
  });
});

router.post('/change-password', requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const result = await authService.changePassword(req.session.user.id, currentPassword, newPassword);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  return res.json({ message: result.message });
}));

router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  return res.status(401).json({ authenticated: false });
});

module.exports = router;
