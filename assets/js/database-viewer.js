document.addEventListener('DOMContentLoaded', () => {
    const api = window.covasolApi;
    if (!api) {
        console.error('Covasol API helper is required.');
        return;
    }

    const loginOverlay = document.getElementById('loginOverlay');
    const viewerContainer = document.getElementById('viewerContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    
    const tablesList = document.getElementById('tablesList');
    const currentTableTitle = document.getElementById('currentTableTitle');
    const emptyState = document.getElementById('emptyState');
    const tableContent = document.getElementById('tableContent');
    const tableStats = document.getElementById('tableStats');
    const columnsTableBody = document.getElementById('columnsTableBody');
    const dataTableHead = document.getElementById('dataTableHead');
    const dataTableBody = document.getElementById('dataTableBody');
    const refreshBtn = document.getElementById('refreshBtn');
    const backToAdminBtn = document.getElementById('backToAdminBtn');
    const exportTableBtn = document.getElementById('exportTableBtn');
    const importTableBtn = document.getElementById('importTableBtn');
    const importFileInput = document.getElementById('importFileInput');

    let currentTable = null;
    let dbSchema = null;

    const tableConfigs = {
        'admin_users': {
            displayName: 'Admin Users',
            icon: 'fa-users',
            apiEndpoint: '/api/database/table/admin_users'
        },
        'blog_posts': {
            displayName: 'Blog Posts',
            icon: 'fa-newspaper',
            apiEndpoint: '/api/database/table/blog_posts'
        },
        'products': {
            displayName: 'Products',
            icon: 'fa-cubes',
            apiEndpoint: '/api/database/table/products'
        }
    };

    async function checkAuth() {
        try {
            const user = await api.currentUser();
            if (user) {
                loginOverlay.classList.add('is-hidden');
                viewerContainer.classList.remove('is-hidden');
                await loadDatabaseSchema();
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginError.textContent = '';

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!username || !password) {
            loginError.textContent = 'Vui lòng nhập tên đăng nhập và mật khẩu.';
            return;
        }

        try {
            await api.login({ username, password });
            loginOverlay.classList.add('is-hidden');
            viewerContainer.classList.remove('is-hidden');
            await loadDatabaseSchema();
        } catch (error) {
            loginError.textContent = error.message || 'Đăng nhập thất bại.';
        }
    });

    async function loadDatabaseSchema() {
        try {
            const response = await fetch('/api/database/schema', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Không thể tải schema database');
            }

            dbSchema = await response.json();
            renderTablesList(dbSchema.tables);
        } catch (error) {
            console.error('Error loading schema:', error);
            alert('Không thể tải schema database: ' + error.message);
        }
    }

    function renderTablesList(tables) {
        tablesList.innerHTML = '';
        
        Object.keys(tables).forEach(tableName => {
            const tableInfo = tables[tableName];
            const config = tableConfigs[tableName] || {
                displayName: tableName,
                icon: 'fa-table'
            };

            const item = document.createElement('div');
            item.className = 'db-table-item';
            item.dataset.table = tableName;
            item.innerHTML = `
                <i class="fas ${config.icon}"></i>
                <span class="db-table-name">${config.displayName}</span>
                <span class="db-table-count">${tableInfo.rowCount || 0}</span>
            `;

            item.addEventListener('click', () => {
                selectTable(tableName);
            });

            tablesList.appendChild(item);
        });
    }

    async function selectTable(tableName) {
        currentTable = tableName;
        
        // Update UI
        document.querySelectorAll('.db-table-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-table="${tableName}"]`)?.classList.add('active');

        const config = tableConfigs[tableName] || { displayName: tableName };
        currentTableTitle.textContent = config.displayName;

        emptyState.classList.add('is-hidden');
        tableContent.classList.remove('is-hidden');

        await loadTableData(tableName);
    }

    async function loadTableData(tableName) {
        try {
            const response = await fetch(`/api/database/table/${tableName}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu bảng');
            }

            const data = await response.json();
            renderTableStats(data);
            renderColumns(data.columns);
            renderData(data.columns, data.rows);
        } catch (error) {
            console.error('Error loading table data:', error);
            alert('Không thể tải dữ liệu bảng: ' + error.message);
        }
    }

    function renderTableStats(data) {
        tableStats.innerHTML = `
            <div class="db-stat-card">
                <div class="db-stat-label">Tổng số dòng</div>
                <div class="db-stat-value">${data.rowCount || 0}</div>
            </div>
            <div class="db-stat-card">
                <div class="db-stat-label">Số cột</div>
                <div class="db-stat-value">${data.columns?.length || 0}</div>
            </div>
            <div class="db-stat-card">
                <div class="db-stat-label">Bảng</div>
                <div class="db-stat-value" style="font-size: 1.25rem;">${currentTable}</div>
            </div>
        `;
    }

    function renderColumns(columns) {
        columnsTableBody.innerHTML = '';
        
        columns.forEach(col => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${col.name}</strong></td>
                <td><span class="db-badge db-badge-primary">${col.type}</span></td>
                <td>${col.notnull === 0 ? '<span class="db-badge db-badge-success">Yes</span>' : '<span class="db-badge db-badge-warning">No</span>'}</td>
                <td>${col.dflt_value || '-'}</td>
                <td>${col.pk === 1 ? '<span class="db-badge db-badge-primary">PRIMARY</span>' : '-'}</td>
            `;
            columnsTableBody.appendChild(row);
        });
    }

    function renderData(columns, rows) {
        // Render header
        dataTableHead.innerHTML = '';
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.name;
            headerRow.appendChild(th);
        });
        dataTableHead.appendChild(headerRow);

        // Render data
        dataTableBody.innerHTML = '';
        rows.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                const value = row[col.name];
                
                if (value === null) {
                    td.textContent = 'NULL';
                    td.style.color = '#94a3b8';
                    td.style.fontStyle = 'italic';
                } else if (typeof value === 'string' && value.length > 100) {
                    td.textContent = value.substring(0, 100) + '...';
                    td.title = value;
                } else {
                    td.textContent = value;
                }
                
                tr.appendChild(td);
            });
            dataTableBody.appendChild(tr);
        });
    }

    refreshBtn.addEventListener('click', async () => {
        if (currentTable) {
            await loadTableData(currentTable);
        } else {
            await loadDatabaseSchema();
        }
    });

    backToAdminBtn.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });

    exportTableBtn.addEventListener('click', async () => {
        if (!currentTable) {
            alert('Vui lòng chọn bảng để export');
            return;
        }

        try {
            const response = await fetch(`/api/database/export/${currentTable}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Không thể export bảng');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentTable}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Export thành công!');
        } catch (error) {
            alert(error.message || 'Không thể export bảng.');
        }
    });

    importTableBtn.addEventListener('click', () => {
        if (!currentTable) {
            alert('Vui lòng chọn bảng để import');
            return;
        }
        importFileInput.click();
    });

    importFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm(`CẢNH BÁO: Import sẽ thay thế dữ liệu hiện tại trong bảng "${currentTable}". Bạn có chắc chắn muốn tiếp tục?`)) {
            importFileInput.value = '';
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`/api/database/import/${currentTable}`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Không thể import bảng');
            }

            const result = await response.json();
            alert(`Import thành công! Đã import ${result.imported} dòng.`);
            
            // Reload table data
            await loadTableData(currentTable);
            importFileInput.value = '';
        } catch (error) {
            alert(error.message || 'Không thể import bảng.');
            importFileInput.value = '';
        }
    });

    // Initialize
    checkAuth();
});
