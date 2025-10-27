(() => {
    const API_BASE = '/api';

    async function apiRequest(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            let errorMessage = 'Đã xảy ra lỗi.';
            try {
                const payload = await response.json();
                errorMessage = payload.message || errorMessage;
            } catch (error) {
                // ignore parse error
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
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

        const qs = params.toString();
        const data = await apiRequest(`/blog${qs ? `?${qs}` : ''}`);
        return data.data || [];
    }

    async function fetchBlogPost(identifier) {
        const data = await apiRequest(`/blog/${encodeURIComponent(identifier)}`);
        return data.data;
    }

    async function fetchProducts(query = {}) {
        const params = new URLSearchParams();
        if (query.limit) params.set('limit', query.limit);
        if (query.offset) params.set('offset', query.offset);
        if (query.search) params.set('search', query.search);
        if (query.category) params.set('category', query.category);

        const qs = params.toString();
        const data = await apiRequest(`/products${qs ? `?${qs}` : ''}`);
        return data.data || [];
    }

    async function fetchProduct(identifier) {
        const data = await apiRequest(`/products/${encodeURIComponent(identifier)}`);
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
        return apiRequest('/blog', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
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
        return apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
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
        changePassword
    };
})();
