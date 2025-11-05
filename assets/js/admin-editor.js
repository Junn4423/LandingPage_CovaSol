document.addEventListener('DOMContentLoaded', () => {
    const api = window.covasolApi;
    if (!api) {
        console.error('Covasol API helper is required for the admin editor.');
        return;
    }

    const editorType = document.body.dataset.editor;
    if (!editorType) {
        console.error('Editor type is missing.');
        return;
    }

    const params = new URLSearchParams(window.location.search);

    const backBtn = document.getElementById('editorBackBtn');
    const logoutBtn = document.getElementById('editorLogoutBtn');
    const cancelBtn = document.getElementById('cancelEditorBtn');
    const userLabel = document.getElementById('editorUserLabel');
    const titleEl = document.getElementById('editorTitle');
    const subtitleEl = document.getElementById('editorSubtitle');

    // Preview Modal Functions
    function showPreviewModal(type, data) {
        // Create modal if doesn't exist
        let modal = document.querySelector('.preview-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'preview-modal';
            modal.innerHTML = `
                <div class="preview-container">
                    <div class="preview-header">
                        <h3>Xem truoc</h3>
                        <button class="preview-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="preview-body">
                        <div class="preview-content"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Close button handler
            const closeBtn = modal.querySelector('.preview-close');
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('is-active');
            });

            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('is-active');
                }
            });

            // ESC key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                    modal.classList.remove('is-active');
                }
            });
        }

        const previewContent = modal.querySelector('.preview-content');
        
        if (type === 'blog') {
            previewContent.innerHTML = renderBlogPreview(data);
        } else if (type === 'product') {
            previewContent.innerHTML = renderProductPreview(data);
        }

        modal.classList.add('is-active');
    }

    function renderBlogPreview(data) {
        const dateStr = data.publishedAt 
            ? new Date(data.publishedAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            : 'Chua xac dinh';

        const tagsHtml = data.tags && data.tags.length > 0
            ? `<div class="preview-tags">
                ${data.tags.map(tag => `<span class="preview-tag">${tag}</span>`).join('')}
               </div>`
            : '';

        return `
            <h1>${data.title || 'Khong co tieu de'}</h1>
            ${data.subtitle ? `<p style="font-size: 1.2rem; color: var(--gray-600); margin-bottom: 1rem;">${data.subtitle}</p>` : ''}
            <div class="preview-meta">
                ${data.category ? `<span><strong>Danh muc:</strong> ${data.category}</span>` : ''}
                <span><strong>Ngay:</strong> ${dateStr}</span>
                ${data.authorName ? `<span><strong>Tac gia:</strong> ${data.authorName}${data.authorRole ? ' - ' + data.authorRole : ''}</span>` : ''}
            </div>
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.title}" />` : ''}
            ${data.excerpt ? `<p style="font-size: 1.1rem; font-style: italic; padding: 1rem; background: #f8fafc; border-left: 4px solid var(--primary-blue); margin: 1.5rem 0;">${data.excerpt}</p>` : ''}
            <div style="white-space: pre-wrap;">${data.content || 'Khong co noi dung'}</div>
            ${tagsHtml}
        `;
    }

    function renderProductPreview(data) {
        const featuresHtml = data.featureTags && data.featureTags.length > 0
            ? `<div class="preview-tags" style="margin-top: 1.5rem;">
                ${data.featureTags.map(tag => `<span class="preview-tag">${tag}</span>`).join('')}
               </div>`
            : '';

        const highlightsHtml = data.highlights && data.highlights.length > 0
            ? `<div style="margin-top: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 0.75rem;">
                <h3 style="margin-bottom: 1rem; color: var(--primary-dark);">Diem noi bat</h3>
                <ul style="list-style: none; padding: 0;">
                    ${data.highlights.map(h => `<li style="padding: 0.5rem 0; display: flex; align-items: start; gap: 0.75rem;">
                        <i class="fas fa-check-circle" style="color: var(--primary-blue); margin-top: 0.25rem;"></i>
                        <span>${h}</span>
                    </li>`).join('')}
                </ul>
               </div>`
            : '';

        return `
            <h1>${data.name || 'Khong co ten san pham'}</h1>
            ${data.category ? `<p style="font-size: 1rem; color: var(--primary-blue); font-weight: 600; margin-bottom: 1rem;">${data.category}</p>` : ''}
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}" />` : ''}
            ${data.shortDescription ? `<p style="font-size: 1.1rem; font-weight: 500; color: var(--gray-700); margin: 1.5rem 0;">${data.shortDescription}</p>` : ''}
            <div style="white-space: pre-wrap; line-height: 1.8;">${data.description || 'Khong co mo ta'}</div>
            ${featuresHtml}
            ${highlightsHtml}
        `;
    }

    function navigateToDashboard() {
        window.location.href = '/admin';
    }

    backBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        navigateToDashboard();
    });

    cancelBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        navigateToDashboard();
    });

    logoutBtn?.addEventListener('click', async () => {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Sign out error:', error);
        }
        navigateToDashboard();
    });

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

    async function ensureSession() {
        try {
            const user = await api.currentUser();
            if (!user) {
                navigateToDashboard();
                return null;
            }
            if (userLabel) {
                userLabel.textContent = `Xin chao, ${user.displayName || user.username}`;
            }
            return user;
        } catch (error) {
            console.warn('Unable to verify session:', error);
            navigateToDashboard();
            return null;
        }
    }

    function setEditorState({ title, subtitle }) {
        if (title && titleEl) {
            titleEl.textContent = title;
        }
        if (subtitle && subtitleEl) {
            subtitleEl.textContent = subtitle;
        }
    }

    async function setupBlogEditor() {
        const blogForm = document.getElementById('blogForm');
        const resetBtn = document.getElementById('resetBlogForm');
        const messageEl = document.getElementById('blogFormMessage');
        const previewBtn = document.getElementById('previewBlogBtn');

        const fields = {
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

        let editingCode = params.get('code');
        let originalPayload = null;

        function clearMessage() {
            if (messageEl) {
                messageEl.textContent = '';
                messageEl.classList.remove('is-success', 'is-error');
            }
        }

        function showMessage(text, type = 'error') {
            if (!messageEl) return;
            messageEl.textContent = text;
            messageEl.classList.toggle('is-error', type === 'error');
            messageEl.classList.toggle('is-success', type === 'success');
        }

        function fillForm(data) {
            if (!data) return;
            fields.code.value = data.code || '';
            fields.title.value = data.title || '';
            fields.subtitle.value = data.subtitle || '';
            fields.category.value = data.category || '';
            fields.image.value = data.imageUrl || '';
            fields.publishedAt.value = formatDateTimeLocal(data.publishedAt);
            fields.excerpt.value = data.excerpt || '';
            fields.content.value = data.content || '';
            fields.tags.value = (data.tags || []).join(', ');
            fields.keywords.value = (data.keywords || []).join(', ');
            fields.author.value = data.authorName || '';
            fields.authorRole.value = data.authorRole || '';
        }

        function resetForm() {
            clearMessage();
            if (editingCode && originalPayload) {
                fillForm(originalPayload);
                fields.code.disabled = true;
                return;
            }
            blogForm?.reset();
            fields.code.value = generateCode('BLOG');
            fields.publishedAt.value = '';
            fields.tags.value = '';
            fields.keywords.value = '';
            fields.code.disabled = false;
        }

        resetBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            resetForm();
        });

        previewBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            const code = fields.code.value.trim();
            if (!code) {
                showMessage('Vui long nhap ma bai viet truoc khi xem truoc.', 'error');
                return;
            }
            
            // Collect preview data
            const previewData = {
                code: fields.code.value.trim(),
                title: fields.title.value.trim(),
                subtitle: fields.subtitle.value.trim(),
                category: fields.category.value.trim(),
                imageUrl: fields.image.value.trim(),
                publishedAt: fields.publishedAt.value,
                excerpt: fields.excerpt.value.trim(),
                content: fields.content.value,
                tags: parseCommaList(fields.tags.value),
                authorName: fields.author.value.trim(),
                authorRole: fields.authorRole.value.trim()
            };
            
            // Open preview modal
            showPreviewModal('blog', previewData);
        });

        blogForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessage();

            const payload = {
                code: fields.code.value.trim(),
                title: fields.title.value.trim(),
                subtitle: fields.subtitle.value.trim() || null,
                category: fields.category.value.trim() || null,
                imageUrl: fields.image.value.trim() || null,
                excerpt: fields.excerpt.value.trim() || null,
                content: fields.content.value,
                tags: parseCommaList(fields.tags.value),
                keywords: parseCommaList(fields.keywords.value),
                authorName: fields.author.value.trim() || null,
                authorRole: fields.authorRole.value.trim() || null,
                publishedAt: toISODate(fields.publishedAt.value),
                status: 'published'
            };

            if (!payload.code) {
                payload.code = generateCode('BLOG');
                fields.code.value = payload.code;
            }

            if (!payload.title || !payload.content) {
                showMessage('Tieu de va noi dung la bat buoc.', 'error');
                return;
            }

            try {
                if (editingCode) {
                    await api.updateBlogPost(editingCode, payload);
                    showMessage('Da cap nhat bai viet thanh cong.', 'success');
                } else {
                    await api.createBlogPost(payload);
                    showMessage('Da tao bai viet moi.', 'success');
                    editingCode = payload.code;
                    fields.code.disabled = true;
                }
                originalPayload = { ...payload };
                setTimeout(() => navigateToDashboard(), 1200);
            } catch (error) {
                showMessage(error.message || 'Khong the luu bai viet.', 'error');
            }
        });

        if (editingCode) {
            setEditorState({
                title: 'Chinh sua bai viet',
                subtitle: 'Cap nhat noi dung va thong tin bai viet.'
            });
            try {
                const blog = await api.fetchBlogPost(editingCode);
                if (!blog) {
                    showMessage('Khong tim thay bai viet.', 'error');
                    fields.code.disabled = false;
                    editingCode = null;
                    resetForm();
                    return;
                }
                originalPayload = blog;
                fillForm(blog);
                fields.code.disabled = true;
            } catch (error) {
                showMessage(error.message || 'Khong the tai bai viet.', 'error');
            }
        } else {
            resetForm();
        }
    }

    async function setupProductEditor() {
        const productForm = document.getElementById('productForm');
        const resetBtn = document.getElementById('resetProductForm');
        const messageEl = document.getElementById('productFormMessage');
        const previewBtn = document.getElementById('previewProductBtn');

        const fields = {
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

        let editingCode = params.get('code');
        let originalPayload = null;

        function clearMessage() {
            if (messageEl) {
                messageEl.textContent = '';
                messageEl.classList.remove('is-success', 'is-error');
            }
        }

        function showMessage(text, type = 'error') {
            if (!messageEl) return;
            messageEl.textContent = text;
            messageEl.classList.toggle('is-error', type === 'error');
            messageEl.classList.toggle('is-success', type === 'success');
        }

        function fillForm(data) {
            if (!data) return;
            fields.code.value = data.code || '';
            fields.name.value = data.name || '';
            fields.category.value = data.category || '';
            fields.image.value = data.imageUrl || '';
            fields.summary.value = data.shortDescription || '';
            fields.description.value = data.description || '';
            fields.features.value = (data.featureTags || []).join(', ');
            fields.highlights.value = (data.highlights || []).join('\n');
            fields.primaryLabel.value = data.ctaPrimary?.label || '';
            fields.primaryUrl.value = data.ctaPrimary?.url || '';
            fields.secondaryLabel.value = data.ctaSecondary?.label || '';
            fields.secondaryUrl.value = data.ctaSecondary?.url || '';
        }

        function resetForm() {
            clearMessage();
            if (editingCode && originalPayload) {
                fillForm(originalPayload);
                fields.code.disabled = true;
                return;
            }
            productForm?.reset();
            fields.code.value = generateCode('PROD');
            fields.features.value = '';
            fields.highlights.value = '';
            fields.code.disabled = false;
        }

        resetBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            resetForm();
        });

        previewBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            const code = fields.code.value.trim();
            if (!code) {
                showMessage('Vui long nhap ma san pham truoc khi xem truoc.', 'error');
                return;
            }
            
            // Collect preview data
            const previewData = {
                code: fields.code.value.trim(),
                name: fields.name.value.trim(),
                category: fields.category.value.trim(),
                imageUrl: fields.image.value.trim(),
                shortDescription: fields.summary.value.trim(),
                description: fields.description.value,
                featureTags: parseCommaList(fields.features.value),
                highlights: parseLines(fields.highlights.value)
            };
            
            // Open preview modal
            showPreviewModal('product', previewData);
        });

        productForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessage();

            const payload = {
                code: fields.code.value.trim(),
                name: fields.name.value.trim(),
                category: fields.category.value.trim() || null,
                imageUrl: fields.image.value.trim() || null,
                shortDescription: fields.summary.value.trim() || null,
                description: fields.description.value,
                featureTags: parseCommaList(fields.features.value),
                highlights: parseLines(fields.highlights.value),
                ctaPrimary: {
                    label: fields.primaryLabel.value.trim() || null,
                    url: fields.primaryUrl.value.trim() || null
                },
                ctaSecondary: {
                    label: fields.secondaryLabel.value.trim() || null,
                    url: fields.secondaryUrl.value.trim() || null
                },
                status: 'active'
            };

            if (!payload.code) {
                payload.code = generateCode('PROD');
                fields.code.value = payload.code;
            }

            if (!payload.name || !payload.description) {
                showMessage('Ten va mo ta chi tiet la bat buoc.', 'error');
                return;
            }

            try {
                if (editingCode) {
                    await api.updateProduct(editingCode, payload);
                    showMessage('Da cap nhat san pham thanh cong.', 'success');
                } else {
                    await api.createProduct(payload);
                    showMessage('Da tao san pham moi.', 'success');
                    editingCode = payload.code;
                    fields.code.disabled = true;
                }
                originalPayload = { ...payload };
                setTimeout(() => navigateToDashboard(), 1200);
            } catch (error) {
                showMessage(error.message || 'Khong the luu san pham.', 'error');
            }
        });

        if (editingCode) {
            setEditorState({
                title: 'Chinh sua san pham',
                subtitle: 'Cap nhat noi dung va thong tin san pham.'
            });
            try {
                const product = await api.fetchProduct(editingCode);
                if (!product) {
                    showMessage('Khong tim thay san pham.', 'error');
                    fields.code.disabled = false;
                    editingCode = null;
                    resetForm();
                    return;
                }
                originalPayload = product;
                fillForm(product);
                fields.code.disabled = true;
            } catch (error) {
                showMessage(error.message || 'Khong the tai san pham.', 'error');
            }
        } else {
            resetForm();
        }
    }

    async function setupUserEditor() {
        const userForm = document.getElementById('userForm');
        const resetBtn = document.getElementById('resetUserForm');
        const messageEl = document.getElementById('userFormMessage');
        const passwordHint = document.getElementById('passwordHint');

        const fields = {
            username: document.getElementById('userUsername'),
            displayName: document.getElementById('userDisplayName'),
            role: document.getElementById('userRole'),
            password: document.getElementById('userPassword')
        };

        const editingId = params.get('id');
        let originalPayload = null;

        function clearMessage() {
            if (messageEl) {
                messageEl.textContent = '';
                messageEl.classList.remove('is-success', 'is-error');
            }
        }

        function showMessage(text, type = 'error') {
            if (!messageEl) return;
            messageEl.textContent = text;
            messageEl.classList.toggle('is-error', type === 'error');
            messageEl.classList.toggle('is-success', type === 'success');
        }

        function resetForm() {
            clearMessage();
            if (editingId && originalPayload) {
                fields.username.value = originalPayload.username || '';
                fields.displayName.value = originalPayload.display_name || '';
                fields.role.value = originalPayload.role || 'admin';
                fields.password.value = '';
                fields.username.disabled = true;
                fields.password.required = false;
                if (passwordHint) {
                    passwordHint.textContent = 'De trong de giu nguyen mat khau cu.';
                }
                return;
            }
            userForm?.reset();
            fields.username.disabled = false;
            fields.password.required = true;
            if (passwordHint) {
                passwordHint.textContent = 'Toi thieu 8 ky tu.';
            }
        }

        resetBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            resetForm();
        });

        userForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessage();

            const payload = {
                username: fields.username.value.trim(),
                displayName: fields.displayName.value.trim(),
                role: fields.role.value
            };

            if (!payload.username || !payload.displayName) {
                showMessage('Ten dang nhap va ten hien thi la bat buoc.', 'error');
                return;
            }

            const passwordValue = fields.password.value.trim();
            if (editingId) {
                if (passwordValue) {
                    if (passwordValue.length < 8) {
                        showMessage('Mat khau phai co it nhat 8 ky tu.', 'error');
                        return;
                    }
                    payload.password = passwordValue;
                }
                try {
                    await api.updateUser(editingId, payload);
                    showMessage('Da cap nhat nguoi dung.', 'success');
                    setTimeout(() => navigateToDashboard(), 1000);
                } catch (error) {
                    showMessage(error.message || 'Khong the cap nhat nguoi dung.', 'error');
                }
            } else {
                if (!passwordValue || passwordValue.length < 8) {
                    showMessage('Vui long nhap mat khau toi thieu 8 ky tu.', 'error');
                    return;
                }
                payload.password = passwordValue;
                try {
                    await api.createUser(payload);
                    showMessage('Da tao nguoi dung moi.', 'success');
                    setTimeout(() => navigateToDashboard(), 1000);
                } catch (error) {
                    showMessage(error.message || 'Khong the tao nguoi dung.', 'error');
                }
            }
        });

        if (editingId) {
            setEditorState({
                title: 'Chinh sua nguoi dung',
                subtitle: 'Cap nhat vai tro va thong tin nguoi dung.'
            });
            try {
                const user = await api.fetchUser(editingId);
                if (!user) {
                    showMessage('Khong tim thay nguoi dung.', 'error');
                    resetForm();
                    return;
                }
                originalPayload = user;
                resetForm();
            } catch (error) {
                showMessage(error.message || 'Khong the tai nguoi dung.', 'error');
            }
        } else {
            resetForm();
        }
    }

    (async function init() {
        const user = await ensureSession();
        if (!user) return;

        if (editorType === 'blog') {
            await setupBlogEditor();
        } else if (editorType === 'product') {
            await setupProductEditor();
        } else if (editorType === 'user') {
            await setupUserEditor();
        } else {
            console.warn(`Unknown editor type: ${editorType}`);
        }
    })();
});
