/**
 * User Management Service
 * Handles all user CRUD operations
 */
const bcrypt = require('bcryptjs');
const { db } = require('../db');

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Get all users (without password)
 * @returns {Promise<Array>}
 */
async function getAllUsers() {
  return db
    .prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users ORDER BY created_at DESC')
    .all();
}

/**
 * Get user by ID (without password)
 * @param {number} id 
 * @returns {Promise<Object|null>}
 */
async function getUserById(id) {
  return db
    .prepare('SELECT id, username, display_name, role, created_at, updated_at FROM admin_users WHERE id = ?')
    .get(id);
}

/**
 * Check if username exists
 * @param {string} username 
 * @param {number} excludeId - Optional user ID to exclude from check
 * @returns {Promise<boolean>}
 */
async function usernameExists(username, excludeId = null) {
  const query = excludeId
    ? 'SELECT id FROM admin_users WHERE username = ? AND id != ?'
    : 'SELECT id FROM admin_users WHERE username = ?';
  
  const params = excludeId ? [username, excludeId] : [username];
  const existing = await db.prepare(query).get(...params);
  return !!existing;
}

/**
 * Create a new user
 * @param {{ username: string, password: string, displayName: string, role?: string }} data 
 * @returns {Promise<{ success: boolean, user?: Object, message?: string }>}
 */
async function createUser({ username, password, displayName, role = 'admin' }) {
  // Validation
  if (!username || !password || !displayName) {
    return { success: false, message: 'Vui lòng nhập đầy đủ thông tin (username, password, displayName).' };
  }

  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return { success: false, message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.` };
  }

  if (await usernameExists(username)) {
    return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
  }

  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

  const result = await db
    .prepare('INSERT INTO admin_users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)')
    .run(username, passwordHash, displayName, role);

  // Get created user - use insertId from MySQL
  const insertedId = result.insertId;
  let newUser = insertedId
    ? await getUserById(insertedId)
    : await db.prepare('SELECT id, username, display_name, role, created_at FROM admin_users WHERE username = ?').get(username);

  return { success: true, user: newUser };
}

/**
 * Update an existing user
 * @param {number} userId 
 * @param {{ username?: string, displayName?: string, role?: string, password?: string }} data 
 * @param {number} currentUserId - ID of user making the change (to prevent self-demotion)
 * @returns {Promise<{ success: boolean, user?: Object, message?: string }>}
 */
async function updateUser(userId, data, currentUserId) {
  const { username, displayName, role, password } = data;

  if (!userId) {
    return { success: false, message: 'ID người dùng không hợp lệ.' };
  }

  // Prevent self-demotion
  if (userId === currentUserId && role && role !== 'admin') {
    return { success: false, message: 'Bạn không thể thay đổi vai trò của chính mình.' };
  }

  const existingUser = await getUserById(userId);
  if (!existingUser) {
    return { success: false, message: 'Không tìm thấy người dùng.' };
  }

  const updates = [];
  const params = [];

  if (username) {
    if (await usernameExists(username, userId)) {
      return { success: false, message: 'Tên đăng nhập đã tồn tại.' };
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
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return { success: false, message: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.` };
    }
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    updates.push('password_hash = ?');
    params.push(passwordHash);
  }

  if (updates.length === 0) {
    return { success: false, message: 'Không có thông tin nào để cập nhật.' };
  }

  params.push(userId);
  await db.prepare(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updatedUser = await getUserById(userId);
  return { success: true, user: updatedUser };
}

/**
 * Delete a user
 * @param {number} userId 
 * @param {number} currentUserId - ID of user making the deletion
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function deleteUser(userId, currentUserId) {
  if (!userId) {
    return { success: false, message: 'ID người dùng không hợp lệ.' };
  }

  if (userId === currentUserId) {
    return { success: false, message: 'Bạn không thể xóa tài khoản của chính mình.' };
  }

  const existingUser = await getUserById(userId);
  if (!existingUser) {
    return { success: false, message: 'Không tìm thấy người dùng.' };
  }

  await db.prepare('DELETE FROM admin_users WHERE id = ?').run(userId);
  return { success: true, message: 'Xóa người dùng thành công.' };
}

module.exports = {
  getAllUsers,
  getUserById,
  usernameExists,
  createUser,
  updateUser,
  deleteUser
};
