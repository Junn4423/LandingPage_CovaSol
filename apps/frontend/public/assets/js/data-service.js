(() => {
    const API_BASE = (window.covasolConfig && window.covasolConfig.apiBase) || '/api';

    async function apiRequest(path, options = {}) {
        let response;
        try {
            response = await fetch(`${API_BASE}${path}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                },
                ...options
            });
        } catch (networkError) {
            const error = new Error('Không thể kết nối tới máy chủ API.');
            error.isNetworkError = true;
            error.cause = networkError;
            throw error;
        }

        const contentType = response.headers.get('content-type') || '';

        if (!response.ok) {
            let errorMessage = 'Đã xảy ra lỗi.';
            if (contentType.includes('application/json')) {
                try {
                    const payload = await response.json();
                    errorMessage = payload.message || errorMessage;
                } catch (error) {
                    // ignore parse error
                }
            } else if (contentType.includes('text/html')) {
                errorMessage = 'API endpoint không khả dụng ở chế độ tĩnh.';
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            error.contentType = contentType;
            throw error;
        }

        if (response.status === 204) {
            return null;
        }

        if (!contentType.includes('application/json')) {
            return null;
        }

        return response.json();
    }

    async function fetchBlogPosts(query = {}) {
        const params = new URLSearchParams();
        if (query.limit) params.set('limit', query.limit);
        if (query.offset) params.set('offset', query.offset);
        if (query.search) params.set('search', query.search);
        if (query.tag) params.set('tag', query.tag);
        if (query.category) params.set('category', query.category);
        if (query.status) params.set('status', query.status);
        if (query.featured !== undefined) params.set('featured', query.featured ? '1' : '0');
        if (query.excludeFeatured) params.set('excludeFeatured', '1');

        const qs = params.toString();
        const data = await apiRequest(`/blog${qs ? `?${qs}` : ''}`);
        return Array.isArray(data?.data) ? data.data : [];
    }

    async function fetchBlogPost(identifier) {
        if (!identifier) {
            throw new Error('Vui lòng cung cấp mã bài viết.');
        }
        const data = await apiRequest(`/blog/${encodeURIComponent(identifier)}`);
        if (!data?.data) {
            throw new Error('Không tìm thấy bài viết.');
        }
        return data.data;
    }

    async function fetchProducts(query = {}) {
        const params = new URLSearchParams();
        if (query.limit) params.set('limit', query.limit);
        if (query.offset) params.set('offset', query.offset);
        if (query.search) params.set('search', query.search);
        if (query.category) params.set('category', query.category);
        if (query.status) params.set('status', query.status);

        const qs = params.toString();
        const data = await apiRequest(`/products${qs ? `?${qs}` : ''}`);
        return Array.isArray(data?.data) ? data.data : [];
    }

    async function fetchProduct(identifier) {
        if (!identifier) {
            throw new Error('Vui lòng cung cấp mã sản phẩm.');
        }
        const data = await apiRequest(`/products/${encodeURIComponent(identifier)}`);
        if (!data?.data) {
            throw new Error('Không tìm thấy sản phẩm.');
        }
        return data.data;
    }

    async function login(credentials) {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async function logout() {
        return apiRequest('/auth/logout', {
            method: 'POST'
        });
    }

    async function currentUser() {
        try {
            const data = await apiRequest('/auth/me');
            return data.user;
        } catch (error) {
            return null;
        }
    }

    async function createBlogPost(payload) {
        const response = await apiRequest('/blog', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return response?.data;
    }

    async function updateBlogPost(code, payload) {
        return apiRequest(`/blog/${encodeURIComponent(code)}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    async function deleteBlogPost(code) {
        return apiRequest(`/blog/${encodeURIComponent(code)}`, {
            method: 'DELETE'
        });
    }

    async function createProduct(payload) {
        const response = await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return response?.data;
    }

    async function updateProduct(code, payload) {
        return apiRequest(`/products/${encodeURIComponent(code)}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    async function deleteProduct(code) {
        return apiRequest(`/products/${encodeURIComponent(code)}`, {
            method: 'DELETE'
        });
    }

    async function changePassword(credentials) {
        return apiRequest('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async function fetchUsers() {
        const data = await apiRequest('/users');
        return data.users || [];
    }

    async function fetchUser(id) {
        const data = await apiRequest(`/users/${encodeURIComponent(id)}`);
        return data.user;
    }

    async function createUser(payload) {
        return apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async function updateUser(id, payload) {
        return apiRequest(`/users/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
    }

    async function deleteUser(id) {
        return apiRequest(`/users/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    }

    window.covasolApi = {
        fetchBlogPosts,
        fetchBlogPost,
        fetchProducts,
        fetchProduct,
        login,
        logout,
        currentUser,
        createBlogPost,
        updateBlogPost,
        deleteBlogPost,
        createProduct,
        updateProduct,
        deleteProduct,
        changePassword,
        fetchUsers,
        fetchUser,
        createUser,
        updateUser,
        deleteUser
    };
})();
