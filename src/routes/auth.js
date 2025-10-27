const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' });
  }

  const user = db
    .prepare('SELECT id, username, password_hash, display_name, role FROM admin_users WHERE username = ?')
    .get(username);

  if (!user) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ message: 'Không thể tạo phiên đăng nhập mới.' });
    }
    req.session.user = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role
    };

    res.json({
      message: 'Đăng nhập thành công.',
      user: req.session.user
    });
  });
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Không thể đăng xuất. Vui lòng thử lại.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Đăng xuất thành công.' });
  });
});

router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.' });
  }

  if (String(newPassword).length < 8) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
  }

  const userRecord = db
    .prepare('SELECT id, password_hash FROM admin_users WHERE id = ?')
    .get(req.session.user.id);

  if (!userRecord) {
    return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
  }

  const isCurrentValid = bcrypt.compareSync(currentPassword, userRecord.password_hash);
  if (!isCurrentValid) {
    return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE admin_users SET password_hash = @password_hash WHERE id = @id').run({
    password_hash: newHash,
    id: userRecord.id
  });

  return res.json({ message: 'Đổi mật khẩu thành công.' });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  return res.status(401).json({ authenticated: false });
});

module.exports = router;
