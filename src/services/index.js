/**
 * Services Index
 * Central export for all service modules
 */

const authService = require('./auth.service');
const userService = require('./user.service');
const blogService = require('./blog.service');
const productService = require('./product.service');

module.exports = {
  authService,
  userService,
  blogService,
  productService
};
