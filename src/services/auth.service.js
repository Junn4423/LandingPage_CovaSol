/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
const bcrypt = require('bcryptjs');
const { db } = require('../db');

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Find user by username
 * @param {string} username 
 * @returns {Promise<Object|null>}
 */
async function findByUsername(username) {
  return db
    .prepare('SELECT id, username, password_hash, display_name, role FROM admin_users WHERE username = ?')
    .get(username);
}

/**
 * Find user by ID
 * @param {number} id 
 * @returns {Promise<Object|null>}
 */
async function findById(id) {
  return db
    .prepare('SELECT id, username, password_hash, display_name, role FROM admin_users WHERE id = ?')
    .get(id);
}

/**
 * Verify password against hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {boolean}
 */
function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/**
 * Hash a password
 * @param {string} password 
 * @returns {string}
 */
function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Validate password meets requirements
 * @param {string} password 
 * @returns {{ valid: boolean, message?: string }}
 */
function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Mật khẩu không được để trống.' };
  }
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.` };
  }
  return { valid: true };
}

/**
 * Update user password
 * @param {number} userId 
 * @param {string} newPassword 
 * @returns {Promise<void>}
 */
async function updatePassword(userId, newPassword) {
  const newHash = hashPassword(newPassword);
  await db
    .prepare('UPDATE admin_users SET password_hash = @password_hash WHERE id = @id')
    .run({ password_hash: newHash, id: userId });
}

/**
 * Authenticate user with credentials
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{ success: boolean, user?: Object, message?: string }>}
 */
async function authenticate(username, password) {
  if (!username || !password) {
    return { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' };
  }

  const user = await findByUsername(username);
  if (!user) {
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
  }

  const passwordMatch = verifyPassword(password, user.password_hash);
  if (!passwordMatch) {
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' };
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role
    }
  };
}

/**
 * Change user password with current password verification
 * @param {number} userId 
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    return { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.' };
  }

  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    return { success: false, message: validation.message };
  }

  const user = await findById(userId);
  if (!user) {
    return { success: false, message: 'Không tìm thấy tài khoản.' };
  }

  if (!verifyPassword(currentPassword, user.password_hash)) {
    return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
  }

  await updatePassword(userId, newPassword);
  return { success: true, message: 'Đổi mật khẩu thành công.' };
}

module.exports = {
  findByUsername,
  findById,
  verifyPassword,
  hashPassword,
  validatePassword,
  updatePassword,
  authenticate,
  changePassword,
  SALT_ROUNDS,
  MIN_PASSWORD_LENGTH
};
