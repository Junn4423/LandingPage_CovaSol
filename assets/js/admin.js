document.addEventListener('DOMContentLoaded', () => {
    const api = window.covasolApi;
    if (!api) {
        console.error('Covasol API helper is required for the admin panel.');
        return;
    }

    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshDataBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const currentUserLabel = document.getElementById('currentUserLabel');

    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const changePasswordMessage = document.getElementById('changePasswordMessage');
    const closeChangePasswordBtn = document.getElementById('closeChangePasswordBtn');
    const cancelChangePasswordBtn = document.getElementById('cancelChangePasswordBtn');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const blogTableBody = document.querySelector('#blogTable tbody');
    const blogCountLabel = document.getElementById('blogCount');
    const blogForm = document.getElementById('blogForm');
    const blogFormMessage = document.getElementById('blogFormMessage');
    const blogFormTitle = document.getElementById('blogFormTitle');
    const resetBlogFormBtn = document.getElementById('resetBlogForm');

    const productTableBody = document.querySelector('#productTable tbody');
    const productCountLabel = document.getElementById('productCount');
    const productForm = document.getElementById('productForm');
    const productFormMessage = document.getElementById('productFormMessage');
    const productFormTitle = document.getElementById('productFormTitle');
    const resetProductFormBtn = document.getElementById('resetProductForm');

    const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
    const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

    const blogFields = {
        code: document.getElementById('blogCode'),
        title: document.getElementById('blogTitle'),
        subtitle: document.getElementById('blogSubtitle'),
        category: document.getElementById('blogCategory'),
        image: document.getElementById('blogImage'),
        publishedAt: document.getElementById('blogPublishedAt'),
        excerpt: document.getElementById('blogExcerpt'),
        content: document.getElementById('blogContent'),
        tags: document.getElementById('blogTags'),
        keywords: document.getElementById('blogKeywords'),
        author: document.getElementById('blogAuthor'),
        authorRole: document.getElementById('blogAuthorRole')
    };

    const productFields = {
        code: document.getElementById('productCode'),
        name: document.getElementById('productNameInput'),
        category: document.getElementById('productCategoryInput'),
        image: document.getElementById('productImage'),
        summary: document.getElementById('productSummary'),
        description: document.getElementById('productDescription'),
        features: document.getElementById('productFeatures'),
        highlights: document.getElementById('productHighlights'),
        primaryLabel: document.getElementById('productPrimaryLabel'),
        primaryUrl: document.getElementById('productPrimaryUrl'),
        secondaryLabel: document.getElementById('productSecondaryLabel'),
        secondaryUrl: document.getElementById('productSecondaryUrl')
    };

    const state = {
        blogEditingCode: null,
        productEditingCode: null
    };

    function generateCode(prefix) {
        const now = new Date();
        const parts = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0'),
            String(now.getSeconds()).padStart(2, '0')
        ];
        return `${prefix}${parts.join('')}`;
    }

    function generateBlogCode() {
        return generateCode('BLOG');
    }

    function generateProductCode() {
        return generateCode('PROD');
    }

    function openChangePasswordModal() {
        changePasswordMessage.textContent = '';
        changePasswordMessage.style.color = '#dc2626';
        changePasswordForm.reset();
        changePasswordModal.classList.remove('is-hidden');
    }

    function closeChangePasswordModal() {
        changePasswordModal.classList.add('is-hidden');
        changePasswordMessage.textContent = '';
        changePasswordMessage.style.color = '#dc2626';
        changePasswordForm.reset();
    }

    function toggleSections(isAuthenticated) {
        loginSection.classList.toggle('is-hidden', isAuthenticated);
        dashboardSection.classList.toggle('is-hidden', !isAuthenticated);
        if (!isAuthenticated) {
            closeChangePasswordModal();
        }
    }

    function parseCommaList(value) {
        if (!value) return [];
        return value
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);
    }

    function parseLines(value) {
        if (!value) return [];
        return value
            .split('\n')
            .map((entry) => entry.trim())
            .filter(Boolean);
    }

    function formatDateTimeLocal(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        const tzOffset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - tzOffset * 60000);
        return localDate.toISOString().slice(0, 16);
    }

    function toISODate(value) {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return date.toISOString();
    }

    function clearBlogForm() {
        blogForm.reset();
        blogFormMessage.textContent = '';
        state.blogEditingCode = null;
        blogFormTitle.textContent = 'Add blog post';
        blogFields.code.disabled = false;
        blogFields.code.value = generateBlogCode();
    }

    function clearProductForm() {
        productForm.reset();
        productFormMessage.textContent = '';
        state.productEditingCode = null;
        productFormTitle.textContent = 'Add product';
        productFields.code.disabled = false;
        productFields.code.value = generateProductCode();
    }

    function populateBlogForm(post) {
        state.blogEditingCode = post.code;
        blogFormTitle.textContent = `Edit: ${post.title}`;
        blogFormMessage.textContent = '';
        blogFields.code.value = post.code;
        blogFields.title.value = post.title || '';
        blogFields.subtitle.value = post.subtitle || '';
        blogFields.category.value = post.category || '';
        blogFields.image.value = post.imageUrl || '';
        blogFields.publishedAt.value = formatDateTimeLocal(post.publishedAt);
        blogFields.excerpt.value = post.excerpt || '';
        blogFields.content.value = post.content || '';
        blogFields.tags.value = (post.tags || []).join(', ');
        blogFields.keywords.value = (post.keywords || []).join(', ');
        blogFields.author.value = post.authorName || '';
        blogFields.authorRole.value = post.authorRole || '';
        blogFields.code.disabled = true;
    }

    function populateProductForm(product) {
        state.productEditingCode = product.code;
        productFormTitle.textContent = `Edit: ${product.name}`;
        productFormMessage.textContent = '';
        productFields.code.value = product.code;
        productFields.name.value = product.name || '';
        productFields.category.value = product.category || '';
        productFields.image.value = product.imageUrl || '';
        productFields.summary.value = product.shortDescription || '';
        productFields.description.value = product.description || '';
        productFields.features.value = (product.featureTags || []).join(', ');
        productFields.highlights.value = (product.highlights || []).join('\n');
        productFields.primaryLabel.value = product.ctaPrimary?.label || '';
        productFields.primaryUrl.value = product.ctaPrimary?.url || '';
        productFields.secondaryLabel.value = product.ctaSecondary?.label || '';
        productFields.secondaryUrl.value = product.ctaSecondary?.url || '';
        productFields.code.disabled = true;
    }

    function renderBlogRows(posts) {
        blogTableBody.innerHTML = '';
        posts.forEach((post) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${post.code}</td>
                <td>${post.title}</td>
                <td>${post.category || '-'}</td>
                <td>${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : '-'}</td>
                <td class="table-actions"></td>
            `;

            const actionsCell = row.querySelector('.table-actions');

            const viewLink = document.createElement('a');
            viewLink.className = 'btn-link';
            viewLink.href = `/blog/post/${encodeURIComponent(post.code)}`;
            viewLink.target = '_blank';
            viewLink.rel = 'noopener';
            viewLink.textContent = 'View';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-chip';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => populateBlogForm(post));

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'action-chip delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', async () => {
                if (!confirm(`Delete blog post "${post.title}"?`)) {
                    return;
                }
                try {
                    await api.deleteBlogPost(post.code);
                    await loadBlogs();
                } catch (error) {
                    alert(error.message || 'Unable to delete the blog post.');
                }
            });

            actionsCell.appendChild(viewLink);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            blogTableBody.appendChild(row);
        });
        blogCountLabel.textContent = `${posts.length} posts`;
    }

    function renderProductRows(products) {
        productTableBody.innerHTML = '';
        products.forEach((product) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${product.category || '-'}</td>
                <td>${product.status || 'active'}</td>
                <td class="table-actions"></td>
            `;

            const actionsCell = row.querySelector('.table-actions');

            const viewLink = document.createElement('a');
            viewLink.className = 'btn-link';
            viewLink.href = `/products/item/${encodeURIComponent(product.code)}`;
            viewLink.target = '_blank';
            viewLink.rel = 'noopener';
            viewLink.textContent = 'View';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-chip';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => populateProductForm(product));

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'action-chip delete';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', async () => {
                if (!confirm(`Delete product "${product.name}"?`)) {
                    return;
                }
                try {
                    await api.deleteProduct(product.code);
                    await loadProducts();
                } catch (error) {
                    alert(error.message || 'Unable to delete the product.');
                }
            });

            actionsCell.appendChild(viewLink);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            productTableBody.appendChild(row);
        });
        productCountLabel.textContent = `${products.length} products`;
    }

    async function loadBlogs() {
        try {
            const posts = await api.fetchBlogPosts({ limit: 100, offset: 0 });
            renderBlogRows(posts);
        } catch (error) {
            blogFormMessage.textContent = error.message || 'Unable to load blog posts.';
        }
    }

    async function loadProducts() {
        try {
            const products = await api.fetchProducts({ limit: 100, offset: 0 });
            renderProductRows(products);
        } catch (error) {
            productFormMessage.textContent = error.message || 'Unable to load products.';
        }
    }

    async function loadAllData() {
        await Promise.all([loadBlogs(), loadProducts()]);
    }

    changePasswordBtn.addEventListener('click', openChangePasswordModal);
    closeChangePasswordBtn.addEventListener('click', closeChangePasswordModal);
    cancelChangePasswordBtn.addEventListener('click', (event) => {
        event.preventDefault();
        closeChangePasswordModal();
    });

    changePasswordModal.addEventListener('click', (event) => {
        if (event.target === changePasswordModal) {
            closeChangePasswordModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !changePasswordModal.classList.contains('is-hidden')) {
            closeChangePasswordModal();
        }
    });

    changePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        changePasswordMessage.textContent = '';
        changePasswordMessage.style.color = '#dc2626';

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!currentPassword || !newPassword) {
            changePasswordMessage.textContent = 'Please fill in all required fields.';
            return;
        }

        if (newPassword.length < 8) {
            changePasswordMessage.textContent = 'Password must be at least 8 characters.';
            return;
        }

        if (newPassword !== confirmPassword) {
            changePasswordMessage.textContent = 'Confirmation does not match the new password.';
            return;
        }

        try {
            await api.changePassword({ currentPassword, newPassword });
            changePasswordMessage.style.color = '#16a34a';
            changePasswordMessage.textContent = 'Password updated successfully.';
            setTimeout(() => {
                closeChangePasswordModal();
            }, 1200);
        } catch (error) {
            changePasswordMessage.style.color = '#dc2626';
            changePasswordMessage.textContent = error.message || 'Unable to update the password.';
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginError.textContent = '';

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!username || !password) {
            loginError.textContent = 'Please fill in both username and password.';
            return;
        }

        try {
            const { user } = await api.login({ username, password });
            toggleSections(true);
            currentUserLabel.textContent = `Hello, ${user.displayName || user.username}`;
            await loadAllData();
        } catch (error) {
            loginError.textContent = error.message || 'Login failed.';
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Sign out error:', error);
        }
        toggleSections(false);
        closeChangePasswordModal();
        clearBlogForm();
        clearProductForm();
        loginForm.reset();
    });

    refreshBtn.addEventListener('click', () => {
        loadAllData();
    });

    blogForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        blogFormMessage.textContent = '';

        const payload = {
            code: blogFields.code.value.trim(),
            title: blogFields.title.value.trim(),
            subtitle: blogFields.subtitle.value.trim() || null,
            category: blogFields.category.value.trim() || null,
            imageUrl: blogFields.image.value.trim() || null,
            excerpt: blogFields.excerpt.value.trim() || null,
            content: blogFields.content.value,
            tags: parseCommaList(blogFields.tags.value),
            keywords: parseCommaList(blogFields.keywords.value),
            authorName: blogFields.author.value.trim() || null,
            authorRole: blogFields.authorRole.value.trim() || null,
            publishedAt: toISODate(blogFields.publishedAt.value),
            status: 'published'
        };

        if (!payload.code) {
            payload.code = generateBlogCode();
            blogFields.code.value = payload.code;
        }

        if (!payload.title || !payload.content) {
            blogFormMessage.textContent = 'Code, title, and content are required.';
            return;
        }

        try {
            if (state.blogEditingCode) {
                await api.updateBlogPost(state.blogEditingCode, payload);
                blogFormMessage.textContent = 'Blog post updated.';
            } else {
                await api.createBlogPost(payload);
                blogFormMessage.textContent = 'Blog post created.';
            }
            await loadBlogs();
            clearBlogForm();
        } catch (error) {
            blogFormMessage.textContent = error.message || 'Unable to save the blog post.';
        }
    });

    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        productFormMessage.textContent = '';

        const payload = {
            code: productFields.code.value.trim(),
            name: productFields.name.value.trim(),
            category: productFields.category.value.trim() || null,
            imageUrl: productFields.image.value.trim() || null,
            shortDescription: productFields.summary.value.trim() || null,
            description: productFields.description.value,
            featureTags: parseCommaList(productFields.features.value),
            highlights: parseLines(productFields.highlights.value),
            ctaPrimary: {
                label: productFields.primaryLabel.value.trim() || null,
                url: productFields.primaryUrl.value.trim() || null
            },
            ctaSecondary: {
                label: productFields.secondaryLabel.value.trim() || null,
                url: productFields.secondaryUrl.value.trim() || null
            },
            status: 'active'
        };

        if (!payload.code) {
            payload.code = generateProductCode();
            productFields.code.value = payload.code;
        }

        if (!payload.name || !payload.description) {
            productFormMessage.textContent = 'Code, name, and description are required.';
            return;
        }

        try {
            if (state.productEditingCode) {
                await api.updateProduct(state.productEditingCode, payload);
                productFormMessage.textContent = 'Product updated.';
            } else {
                await api.createProduct(payload);
                productFormMessage.textContent = 'Product created.';
            }
            await loadProducts();
            clearProductForm();
        } catch (error) {
            productFormMessage.textContent = error.message || 'Unable to save the product.';
        }
    });

    resetBlogFormBtn.addEventListener('click', () => {
        clearBlogForm();
    });

    resetProductFormBtn.addEventListener('click', () => {
        clearProductForm();
    });

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.dataset.tab;
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabPanels.forEach((panel) => panel.classList.add('is-hidden'));
            button.classList.add('active');
            document.getElementById(target).classList.remove('is-hidden');
        });
    });

    clearBlogForm();
    clearProductForm();

    (async function bootstrap() {
        try {
            const user = await api.currentUser();
            if (user) {
                toggleSections(true);
                currentUserLabel.textContent = `Hello, ${user.displayName || user.username}`;
                await loadAllData();
            } else {
                toggleSections(false);
                closeChangePasswordModal();
            }
        } catch (error) {
            console.warn('Unable to verify session:', error);
            toggleSections(false);
            closeChangePasswordModal();
        }
    })();
});
