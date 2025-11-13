document.addEventListener('DOMContentLoaded', () => {
    const api = window.covasolApi;
    if (!api) {
        console.error('Covasol API helper is required for the admin dashboard.');
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
    const blogFeedback = document.getElementById('blogFeedback');
    const createBlogBtn = document.getElementById('createBlogBtn');

    const productTableBody = document.querySelector('#productTable tbody');
    const productCountLabel = document.getElementById('productCount');
    const productFeedback = document.getElementById('productFeedback');
    const createProductBtn = document.getElementById('createProductBtn');

    const usersTableBody = document.querySelector('#usersTable tbody');
    const userCountLabel = document.getElementById('userCount');
    const userFeedback = document.getElementById('userFeedback');
    const createUserBtn = document.getElementById('createUserBtn');

    const exportDatabaseBtn = document.getElementById('exportDatabaseBtn');
    const downloadTemplateBtn = document.getElementById('downloadTemplateBtn');
    const importDatabaseBtn = document.getElementById('importDatabaseBtn');
    const importFileInput = document.getElementById('importFileInput');
    const importMessage = document.getElementById('importMessage');

    const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
    const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

    function setFeedback(element, message, type = 'info') {
        if (!element) return;
        element.textContent = message;
        element.classList.remove('is-error', 'is-success', 'is-info');
        element.classList.add(`is-${type}`);
    }

    function toggleSections(isAuthenticated) {
        loginSection.classList.toggle('is-hidden', isAuthenticated);
        dashboardSection.classList.toggle('is-hidden', !isAuthenticated);
        if (!isAuthenticated) {
            closeChangePasswordModal();
        }
    }

    function openChangePasswordModal() {
        changePasswordMessage.textContent = '';
        changePasswordMessage.classList.remove('is-success', 'is-error');
        changePasswordForm.reset();
        changePasswordModal.classList.remove('is-hidden');
        currentPasswordInput.focus();
    }

    function closeChangePasswordModal() {
        changePasswordModal.classList.add('is-hidden');
        changePasswordMessage.textContent = '';
        changePasswordMessage.classList.remove('is-success', 'is-error');
        changePasswordForm.reset();
    }

    function ensureTableContent(tbody, colSpan, emptyLabel) {
        if (!tbody || tbody.children.length > 0) {
            return;
        }
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'table-empty';
        const cell = document.createElement('td');
        cell.colSpan = colSpan;
        cell.textContent = emptyLabel;
        emptyRow.appendChild(cell);
        tbody.appendChild(emptyRow);
    }

    const blogStatusLabels = {
        active: 'Dang hien',
        inactive: 'Da an'
    };

    const productStatusLabels = {
        active: 'Dang hien',
        inactive: 'Tam dung'
    };

    function isBlogActive(status) {
        return (status || 'draft').toLowerCase() === 'published';
    }

    function isProductActive(status) {
        return (status || 'inactive').toLowerCase() === 'active';
    }

    function updateStatusPill(pill, isActive, labels) {
        if (!pill) return;
        pill.textContent = isActive ? labels.active : labels.inactive;
        pill.classList.toggle('is-live', isActive);
        pill.classList.toggle('is-muted', !isActive);
    }

    function createStatusControl({ isActive, labels, onToggle }) {
        const cell = document.createElement('td');
        cell.className = 'status-cell';

        const wrapper = document.createElement('div');
        wrapper.className = 'status-toggle';

        const pill = document.createElement('span');
        pill.className = 'status-pill';
        updateStatusPill(pill, isActive, labels);

        const switchLabel = document.createElement('label');
        switchLabel.className = 'status-switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isActive;

        const slider = document.createElement('span');
        slider.className = 'status-slider';

        switchLabel.appendChild(checkbox);
        switchLabel.appendChild(slider);

        wrapper.appendChild(pill);
        wrapper.appendChild(switchLabel);
        cell.appendChild(wrapper);

        checkbox.addEventListener('change', async () => {
            const nextChecked = checkbox.checked;
            updateStatusPill(pill, nextChecked, labels);
            checkbox.disabled = true;
            try {
                await onToggle(nextChecked);
            } catch (error) {
                checkbox.checked = !nextChecked;
                updateStatusPill(pill, checkbox.checked, labels);
                alert(error.message || 'Khong the cap nhat trang thai.');
            } finally {
                checkbox.disabled = false;
            }
        });

        return cell;
    }

    function buildBlogPayload(source, overrides = {}) {
        return {
            code: source.code,
            title: source.title || '',
            subtitle: source.subtitle || null,
            category: source.category || null,
            imageUrl: source.imageUrl || source.image || null,
            excerpt: source.excerpt || null,
            content: source.content || '',
            tags: Array.isArray(source.tags) ? source.tags : [],
            keywords: Array.isArray(source.keywords) ? source.keywords : [],
            authorName: source.authorName || null,
            authorRole: source.authorRole || null,
            publishedAt: source.publishedAt || null,
            status: overrides.status ?? source.status ?? 'draft'
        };
    }

    function buildProductPayload(source, overrides = {}) {
        return {
            code: source.code,
            name: source.name || '',
            category: source.category || null,
            imageUrl: source.imageUrl || null,
            shortDescription: source.shortDescription || null,
            description: source.description || '',
            featureTags: Array.isArray(source.featureTags) ? source.featureTags : [],
            highlights: Array.isArray(source.highlights) ? source.highlights : [],
            ctaPrimary: {
                label: source.ctaPrimary?.label || null,
                url: source.ctaPrimary?.url || null
            },
            ctaSecondary: {
                label: source.ctaSecondary?.label || null,
                url: source.ctaSecondary?.url || null
            },
            status: overrides.status ?? source.status ?? 'inactive'
        };
    }

    async function persistBlogStatus(code, nextStatus) {
        const detail = await api.fetchBlogPost(code);
        const payload = buildBlogPayload(detail, { status: nextStatus });
        await api.updateBlogPost(code, payload);
    }

    async function persistProductStatus(code, nextStatus) {
        const detail = await api.fetchProduct(code);
        const payload = buildProductPayload(detail, { status: nextStatus });
        await api.updateProduct(code, payload);
    }

    function navigateTo(path, params = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, value);
            }
        });
        const query = searchParams.toString();
        window.location.href = query ? `${path}?${query}` : path;
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
            const statusCell = createStatusControl({
                isActive: isBlogActive(post.status),
                labels: blogStatusLabels,
                onToggle: async (nextChecked) => {
                    const nextStatus = nextChecked ? 'published' : 'draft';
                    try {
                        await persistBlogStatus(post.code, nextStatus);
                        post.status = nextStatus;
                    } catch (error) {
                        throw new Error(error.message || 'Khong the cap nhat trang thai bai viet.');
                    }
                }
            });
            row.insertBefore(statusCell, actionsCell);

            const viewLink = document.createElement('a');
            viewLink.className = 'btn-link';
            viewLink.href = `blog-detail.html?code=${encodeURIComponent(post.code)}`;
            viewLink.target = '_blank';
            viewLink.rel = 'noopener';
            viewLink.textContent = 'Xem';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-chip';
            editBtn.textContent = 'Sua';
            editBtn.addEventListener('click', () => {
                navigateTo('admin-blog-editor.html', { code: post.code });
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'action-chip delete';
            deleteBtn.textContent = 'Xoa';
            deleteBtn.addEventListener('click', async () => {
                if (!confirm(`Xoa bai viet "${post.title}"?`)) {
                    return;
                }
                try {
                    await api.deleteBlogPost(post.code);
                    await loadBlogs();
                } catch (error) {
                    alert(error.message || 'Khong the xoa bai viet.');
                }
            });

            actionsCell.appendChild(viewLink);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            blogTableBody.appendChild(row);
        });

        ensureTableContent(blogTableBody, 6, 'Chua co bai viet nao.');
        blogCountLabel.textContent = `${posts.length} bai viet`;
    }

    function renderProductRows(products) {
        productTableBody.innerHTML = '';
        products.forEach((product) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td>${product.category || '-'}</td>
                <td class="table-actions"></td>
            `;

            const actionsCell = row.querySelector('.table-actions');
            const statusCell = createStatusControl({
                isActive: isProductActive(product.status),
                labels: productStatusLabels,
                onToggle: async (nextChecked) => {
                    const nextStatus = nextChecked ? 'active' : 'inactive';
                    try {
                        await persistProductStatus(product.code, nextStatus);
                        product.status = nextStatus;
                    } catch (error) {
                        throw new Error(error.message || 'Khong the cap nhat trang thai san pham.');
                    }
                }
            });
            row.insertBefore(statusCell, actionsCell);

            const viewLink = document.createElement('a');
            viewLink.className = 'btn-link';
            viewLink.href = `product-detail.html?code=${encodeURIComponent(product.code)}`;
            viewLink.target = '_blank';
            viewLink.rel = 'noopener';
            viewLink.textContent = 'Xem';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-chip';
            editBtn.textContent = 'Sua';
            editBtn.addEventListener('click', () => {
                navigateTo('admin-product-editor.html', { code: product.code });
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'action-chip delete';
            deleteBtn.textContent = 'Xoa';
            deleteBtn.addEventListener('click', async () => {
                if (!confirm(`Xoa san pham "${product.name}"?`)) {
                    return;
                }
                try {
                    await api.deleteProduct(product.code);
                    await loadProducts();
                } catch (error) {
                    alert(error.message || 'Khong the xoa san pham.');
                }
            });

            actionsCell.appendChild(viewLink);
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            productTableBody.appendChild(row);
        });

        ensureTableContent(productTableBody, 5, 'Chua co san pham nao.');
        productCountLabel.textContent = `${products.length} san pham`;
    }

    function renderUserRows(users) {
        usersTableBody.innerHTML = '';
        users.forEach((user) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.display_name || '-'}</td>
                <td><span class="badge">${user.role || 'admin'}</span></td>
                <td class="table-actions"></td>
            `;

            const actionsCell = row.querySelector('.table-actions');

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'action-chip';
            editBtn.textContent = 'Sua';
            editBtn.addEventListener('click', () => {
                navigateTo('admin-user-editor.html', { id: user.id });
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'action-chip delete';
            deleteBtn.textContent = 'Xoa';
            deleteBtn.addEventListener('click', async () => {
                if (!confirm(`Xoa nguoi dung "${user.username}"?`)) {
                    return;
                }
                try {
                    await api.deleteUser(user.id);
                    await loadUsers();
                } catch (error) {
                    alert(error.message || 'Khong the xoa nguoi dung.');
                }
            });

            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            usersTableBody.appendChild(row);
        });

        ensureTableContent(usersTableBody, 5, 'Chua co nguoi dung nao.');
        userCountLabel.textContent = `${users.length} nguoi dung`;
    }

    async function loadBlogs() {
        setFeedback(blogFeedback, 'Dang tai danh sach...', 'info');
        try {
            const posts = await api.fetchBlogPosts({ limit: 100, offset: 0 });
            renderBlogRows(posts);
            setFeedback(blogFeedback, '', 'info');
        } catch (error) {
            console.error('Error loading blogs:', error);
            setFeedback(blogFeedback, error.message || 'Khong the tai danh sach blog.', 'error');
            blogTableBody.innerHTML = '';
            ensureTableContent(blogTableBody, 6, 'Khong the tai du lieu.');
            blogCountLabel.textContent = '0 bai viet';
        }
    }

    async function loadProducts() {
        setFeedback(productFeedback, 'Dang tai danh sach...', 'info');
        try {
            const products = await api.fetchProducts({ limit: 100, offset: 0 });
            renderProductRows(products);
            setFeedback(productFeedback, '', 'info');
        } catch (error) {
            console.error('Error loading products:', error);
            setFeedback(productFeedback, error.message || 'Khong the tai danh sach san pham.', 'error');
            productTableBody.innerHTML = '';
            ensureTableContent(productTableBody, 5, 'Khong the tai du lieu.');
            productCountLabel.textContent = '0 san pham';
        }
    }

    async function loadUsers() {
        setFeedback(userFeedback, 'Dang tai danh sach...', 'info');
        try {
            const users = await api.fetchUsers();
            renderUserRows(users);
            setFeedback(userFeedback, '', 'info');
        } catch (error) {
            console.error('Error loading users:', error);
            setFeedback(userFeedback, error.message || 'Khong the tai danh sach nguoi dung.', 'error');
            usersTableBody.innerHTML = '';
            ensureTableContent(usersTableBody, 5, 'Khong the tai du lieu.');
            userCountLabel.textContent = '0 nguoi dung';
        }
    }

    async function loadAllData() {
        await Promise.all([loadBlogs(), loadProducts(), loadUsers()]);
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
        changePasswordMessage.classList.remove('is-success', 'is-error');

        const currentPassword = currentPasswordInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!currentPassword || !newPassword) {
            changePasswordMessage.textContent = 'Vui long nhap day du thong tin.';
            changePasswordMessage.classList.add('is-error');
            return;
        }

        if (newPassword.length < 8) {
            changePasswordMessage.textContent = 'Mat khau moi phai co it nhat 8 ky tu.';
            changePasswordMessage.classList.add('is-error');
            return;
        }

        if (newPassword !== confirmPassword) {
            changePasswordMessage.textContent = 'Mat khau nhap lai khong khop.';
            changePasswordMessage.classList.add('is-error');
            return;
        }

        try {
            await api.changePassword({ currentPassword, newPassword });
            changePasswordMessage.textContent = 'Da cap nhat mat khau.';
            changePasswordMessage.classList.add('is-success');
            setTimeout(() => closeChangePasswordModal(), 1200);
        } catch (error) {
            changePasswordMessage.textContent = error.message || 'Khong the cap nhat mat khau.';
            changePasswordMessage.classList.add('is-error');
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginError.textContent = '';

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!username || !password) {
            loginError.textContent = 'Vui long nhap ten dang nhap va mat khau.';
            return;
        }

        try {
            const { user } = await api.login({ username, password });
            toggleSections(true);
            currentUserLabel.textContent = `Xin chao, ${user.displayName || user.username}`;
            await loadAllData();
        } catch (error) {
            loginError.textContent = error.message || 'Dang nhap that bai.';
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Sign out error:', error);
        }
        toggleSections(false);
        loginForm.reset();
    });

    refreshBtn.addEventListener('click', () => {
        loadAllData();
    });

    createBlogBtn.addEventListener('click', () => {
    navigateTo('admin-blog-editor.html');
    });

    createProductBtn.addEventListener('click', () => {
    navigateTo('admin-product-editor.html');
    });

    createUserBtn.addEventListener('click', () => {
    navigateTo('admin-user-editor.html');
    });

    exportDatabaseBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/database/export', {
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Khong the xuat database.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `covasol_database_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Da xuat database thanh cong!');
        } catch (error) {
            alert(error.message || 'Khong the xuat database.');
        }
    });

    downloadTemplateBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/database/template', {
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Khong the tai template.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'covasol_database_template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert(error.message || 'Khong the tai template.');
        }
    });

    importDatabaseBtn.addEventListener('click', async () => {
        const file = importFileInput.files[0];
        importMessage.textContent = '';
        importMessage.classList.remove('is-success', 'is-error');

        if (!file) {
            importMessage.textContent = 'Vui long chon file Excel de import.';
            importMessage.classList.add('is-error');
            return;
        }

        if (!confirm('Import se thay the toan bo du lieu hien tai. Ban co chac chan?')) {
            return;
        }

        importMessage.textContent = 'Dang import...';
        importMessage.classList.add('is-info');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/database/import', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Khong the import database.');
            }

            const result = await response.json();
            importMessage.textContent = `${result.message} (Users: ${result.stats.users}, Blogs: ${result.stats.blogs}, Products: ${result.stats.products})`;
            importMessage.classList.remove('is-info');
            importMessage.classList.add('is-success');
            importFileInput.value = '';
            await loadAllData();
        } catch (error) {
            importMessage.textContent = error.message || 'Khong the import database.';
            importMessage.classList.remove('is-info');
            importMessage.classList.add('is-error');
        }
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

    (async function bootstrap() {
        try {
            const user = await api.currentUser();
            if (user) {
                toggleSections(true);
                currentUserLabel.textContent = `Xin chao, ${user.displayName || user.username}`;
                await loadAllData();
            } else {
                toggleSections(false);
            }
        } catch (error) {
            console.warn('Unable to verify session:', error);
            toggleSections(false);
        }
    })();
});
