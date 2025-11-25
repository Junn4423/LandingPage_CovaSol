/**
 * URL Helper Functions
 * Utilities for generating SEO-friendly URLs with slugs
 */

(() => {
    /**
     * Generates a blog detail URL using slug
     * @param {Object} post - Blog post object with slug or code
     * @returns {string} - Blog detail URL
     */
    function getBlogUrl(post) {
        if (!post) return 'blog-detail.html';
        const identifier = post.slug || post.code;
        return `blog-detail.html/${encodeURIComponent(identifier)}`;
    }

    /**
     * Generates a product detail URL using slug
     * @param {Object} product - Product object with slug or code
     * @returns {string} - Product detail URL
     */
    function getProductUrl(product) {
        if (!product) return 'product-detail.html';
        const identifier = product.slug || product.code;
        return `product-detail.html/${encodeURIComponent(identifier)}`;
    }

    /**
     * Generates an admin blog editor URL using code
     * @param {string} code - Blog post code
     * @returns {string} - Blog editor URL
     */
    function getAdminBlogEditorUrl(code) {
        if (!code) return 'live-blog-editor.html';
        return `live-blog-editor.html?code=${encodeURIComponent(code)}`;
    }

    /**
     * Generates an admin product editor URL using code
     * @param {string} code - Product code
     * @returns {string} - Product editor URL
     */
    function getAdminProductEditorUrl(code) {
        if (!code) return 'live-product-editor.html';
        return `live-product-editor.html?code=${encodeURIComponent(code)}`;
    }

    // Expose to global scope
    window.covasolUrls = {
        getBlogUrl,
        getProductUrl,
        getAdminBlogEditorUrl,
        getAdminProductEditorUrl
    };
})();
