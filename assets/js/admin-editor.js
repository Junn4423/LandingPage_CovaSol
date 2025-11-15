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
    const previewRenderers = window.covasolPreview;

    const generateClientId = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `rep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    };

    const escapeHtmlLite = (value = '') =>
        String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const escapeSelector = (value = '') => {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }
        return value.replace(/[^\w-]/g, '_');
    };

    const sortInlineMeta = (items = []) =>
        (items || [])
            .filter((item) => item && item.clientId)
            .sort((a, b) => (parsePositionValue(a.position) ?? 0) - (parsePositionValue(b.position) ?? 0));

    const renderPreviewHTML = (type, data) => {
        if (!previewRenderers) {
            return '<p class="preview-error">Không thể tải module preview. Vui lòng tải lại trang.</p>';
        }
        if (type === 'blog' && typeof previewRenderers.renderBlogPreview === 'function') {
            return previewRenderers.renderBlogPreview(data);
        }
        if (type === 'product' && typeof previewRenderers.renderProductPreview === 'function') {
            return previewRenderers.renderProductPreview(data);
        }
        return '<p class="preview-error">Không tìm thấy hàm render phù hợp.</p>';
    };

    function ensurePreviewModal() {
        let modal = document.querySelector('.preview-modal');
        if (modal) {
            return modal;
        }

        modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-container">
                <div class="preview-header">
                    <h3>Xem trước nội dung</h3>
                    <button class="preview-close" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-toolbar">
                    <label class="preview-toggle">
                        <input type="checkbox" data-preview-custom-toggle />
                        <span>Custom mode · Sắp xếp ảnh/video chèn</span>
                    </label>
                    <div class="preview-toolbar__hint">
                        <i class="fas fa-arrows-up-down"></i>
                        <span>Kéo thả hoặc dùng mũi tên để thay đổi vị trí xuất hiện.</span>
                    </div>
                </div>
                <div class="preview-body">
                    <div class="preview-layout">
                        <div class="preview-scroll">
                            <div class="preview-content"></div>
                        </div>
                        <aside class="preview-custom-panel" data-preview-custom-panel>
                            <div class="preview-custom-panel__header">
                                <div>
                                    <h4>Danh sách đang chèn</h4>
                                    <p>Chọn phần tử để highlight trong preview.</p>
                                </div>
                                <button type="button" class="preview-custom-close" data-preview-custom-close>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <p class="preview-custom-empty" data-preview-custom-empty>
                                Không có ảnh/video nào đang chèn vào nội dung.
                            </p>
                            <ul class="preview-custom-list" data-preview-custom-list></ul>
                        </aside>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.preview-close');
        closeBtn.addEventListener('click', () => modal.classList.remove('is-active'));

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('is-active');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('is-active')) {
                modal.classList.remove('is-active');
            }
        });

        setupPreviewInteractions(modal);
        return modal;
    }

    function setupPreviewInteractions(modal) {
        if (modal.__previewUiReady) return;
        const customToggle = modal.querySelector('[data-preview-custom-toggle]');
        const customClose = modal.querySelector('[data-preview-custom-close]');
        const customList = modal.querySelector('[data-preview-custom-list]');
        const previewScroll = modal.querySelector('.preview-scroll');

        customToggle?.addEventListener('change', () => {
            const state = modal.__previewState;
            if (!state) return;
            const enabled = Boolean(customToggle.checked) && !!state.inlineItems.length && !!state.applyInlineOrder;
            setCustomMode(modal, enabled);
        });

        customClose?.addEventListener('click', () => {
            setCustomMode(modal, false);
            if (customToggle) {
                customToggle.checked = false;
            }
        });

        customList?.addEventListener('click', (event) => {
            const targetItem = event.target.closest('[data-inline-item]');
            if (!targetItem) return;
            const inlineId = targetItem.dataset.inlineItem;
            if (!inlineId) return;
            const moveBtn = event.target.closest('[data-move]');
            if (moveBtn) {
                event.preventDefault();
                moveInlineItem(modal, inlineId, moveBtn.dataset.move);
                return;
            }
            selectInlineItem(modal, inlineId, { scrollPreview: true });
        });

        let dragId = null;
        customList?.addEventListener('dragstart', (event) => {
            const row = event.target.closest('[data-inline-item]');
            if (!row) return;
            dragId = row.dataset.inlineItem;
            row.classList.add('is-dragging');
            event.dataTransfer.effectAllowed = 'move';
        });

        customList?.addEventListener('dragend', (event) => {
            const row = event.target.closest('[data-inline-item]');
            if (row) {
                row.classList.remove('is-dragging');
            }
            dragId = null;
        });

        customList?.addEventListener('dragover', (event) => {
            if (!dragId) return;
            const overRow = event.target.closest('[data-inline-item]');
            if (!overRow || overRow.dataset.inlineItem === dragId) return;
            event.preventDefault();
        });

        customList?.addEventListener('drop', (event) => {
            if (!dragId) return;
            const targetRow = event.target.closest('[data-inline-item]');
            if (!targetRow || !targetRow.dataset.inlineItem || targetRow.dataset.inlineItem === dragId) {
                dragId = null;
                return;
            }
            event.preventDefault();
            reorderInlineItems(modal, dragId, targetRow.dataset.inlineItem);
            dragId = null;
        });

        previewScroll?.addEventListener('click', (event) => {
            const inlineBlock = event.target.closest('[data-inline-id]');
            if (!inlineBlock) return;
            const state = modal.__previewState;
            if (!state?.customEnabled) return;
            selectInlineItem(modal, inlineBlock.dataset.inlineId, { focusList: true, scrollPreview: false });
        });

        modal.__previewUiReady = true;
    }

    function setCustomMode(modal, enabled) {
        const state = modal.__previewState;
        const customToggle = modal.querySelector('[data-preview-custom-toggle]');
        const panel = modal.querySelector('[data-preview-custom-panel]');
        if (!state || !panel) return;

        if (!state.inlineItems.length || !state.applyInlineOrder) {
            enabled = false;
        }

        state.customEnabled = enabled;
        panel.classList.toggle('is-visible', enabled);
        modal.classList.toggle('preview-custom-active', enabled);
        if (customToggle) {
            customToggle.checked = enabled;
        }
        if (enabled) {
            renderCustomList(modal);
        } else {
            state.selectedInlineId = null;
            highlightInlineBlock(modal, null);
        }
    }

    function updateCustomModeUi(modal) {
        const state = modal.__previewState;
        if (!state) return;
        const customToggle = modal.querySelector('[data-preview-custom-toggle]');
        const panel = modal.querySelector('[data-preview-custom-panel]');
        const emptyHint = modal.querySelector('[data-preview-custom-empty]');

        const hasInlineItems = Boolean(state.inlineItems.length && state.applyInlineOrder);

        if (customToggle) {
            customToggle.disabled = !hasInlineItems;
            if (!hasInlineItems) {
                customToggle.checked = false;
            }
        }

        if (!hasInlineItems) {
            panel?.classList.remove('is-visible');
            modal.classList.remove('preview-custom-active');
        } else if (state.customEnabled) {
            panel?.classList.add('is-visible');
            modal.classList.add('preview-custom-active');
            renderCustomList(modal);
        }

        emptyHint?.classList.toggle('is-visible', !hasInlineItems);
    }

    function renderCustomList(modal) {
        const state = modal.__previewState;
        const listEl = modal.querySelector('[data-preview-custom-list]');
        const panel = modal.querySelector('[data-preview-custom-panel]');
        const emptyHint = modal.querySelector('[data-preview-custom-empty]');
        if (!state || !listEl || !panel) return;

        panel.classList.toggle('is-empty', !state.inlineItems.length);
        emptyHint?.classList.toggle('is-visible', !state.inlineItems.length);
        if (!state.inlineItems.length) {
            listEl.innerHTML = '';
            return;
        }

        const itemsHtml = state.inlineItems
            .map((item, index) => {
                const isSelected = state.selectedInlineId === item.clientId;
                const thumb = item.url
                    ? `<img src="${escapeHtmlLite(item.url)}" alt="${escapeHtmlLite(item.label || 'Media')}" />`
                    : '<span class="thumb-placeholder"><i class="fas fa-image"></i></span>';
                const caption = item.caption ? `<p class="custom-item-caption">${escapeHtmlLite(item.caption)}</p>` : '';
                return `
                    <li class="preview-custom-item${isSelected ? ' is-selected' : ''}" draggable="true" data-inline-item="${escapeHtmlLite(
                        item.clientId
                    )}" data-source-key="${escapeHtmlLite(item.sourceKey || '')}">
                        <div class="custom-item-thumb">${thumb}</div>
                        <div class="custom-item-info">
                            <p class="custom-item-label">${escapeHtmlLite(item.label || 'Media')} · #${index + 1}</p>
                            ${caption}
                        </div>
                        <div class="custom-item-actions">
                            <button type="button" class="custom-action-btn" data-move="up" title="Di chuyển lên">
                                <i class="fas fa-arrow-up"></i>
                            </button>
                            <button type="button" class="custom-action-btn" data-move="down" title="Di chuyển xuống">
                                <i class="fas fa-arrow-down"></i>
                            </button>
                            <span class="custom-item-handle" title="Kéo để sắp xếp">
                                <i class="fas fa-grip-vertical"></i>
                            </span>
                        </div>
                    </li>
                `;
            })
            .join('');

        listEl.innerHTML = itemsHtml;
    }

    function selectInlineItem(modal, inlineId, { scrollPreview = false, focusList = false } = {}) {
        const state = modal.__previewState;
        const listItems = modal.querySelectorAll('[data-inline-item]');
        if (!state) return;
        state.selectedInlineId = inlineId;
        listItems.forEach((item) => {
            item.classList.toggle('is-selected', item.dataset.inlineItem === inlineId);
            if (focusList && item.dataset.inlineItem === inlineId) {
                item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        highlightInlineBlock(modal, inlineId, { scrollIntoView: scrollPreview });
    }

    function highlightInlineBlock(modal, inlineId, { scrollIntoView = false } = {}) {
        const previewContent = modal.querySelector('.preview-content');
        if (!previewContent) return;
        previewContent.querySelectorAll('.preview-inline-block').forEach((node) => {
            node.classList.toggle('is-highlighted', inlineId && node.dataset.inlineId === inlineId);
        });
        if (!inlineId) return;
        const selector = `[data-inline-id="${escapeSelector(inlineId)}"]`;
        const target = previewContent.querySelector(selector);
        if (target && scrollIntoView) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function moveInlineItem(modal, inlineId, direction) {
        const state = modal.__previewState;
        if (!state || !state.inlineItems.length) return;
        const index = state.inlineItems.findIndex((item) => item.clientId === inlineId);
        if (index === -1) return;
        const delta = direction === 'up' ? -1 : 1;
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= state.inlineItems.length) return;
        const [moved] = state.inlineItems.splice(index, 1);
        state.inlineItems.splice(targetIndex, 0, moved);
        renderCustomList(modal);
        selectInlineItem(modal, inlineId);
        commitInlineOrder(modal);
    }

    function reorderInlineItems(modal, draggedId, targetId) {
        const state = modal.__previewState;
        if (!state) return;
        const current = state.inlineItems.slice();
        const fromIndex = current.findIndex((item) => item.clientId === draggedId);
        const toIndex = current.findIndex((item) => item.clientId === targetId);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
        const [moved] = current.splice(fromIndex, 1);
        current.splice(toIndex, 0, moved);
        state.inlineItems = current;
        renderCustomList(modal);
        selectInlineItem(modal, moved.clientId);
        commitInlineOrder(modal);
    }

    async function commitInlineOrder(modal) {
        const state = modal.__previewState;
        if (!state || typeof state.applyInlineOrder !== 'function') return;
        if (state.isSyncing) return;
        state.isSyncing = true;
        modal.classList.add('is-syncing');
        try {
            const orderedItems = state.inlineItems.map((item, index) => ({
                ...item,
                position: index
            }));
            const snapshot = await Promise.resolve(state.applyInlineOrder(orderedItems));
            if (snapshot?.data) {
                state.data = snapshot.data;
                state.inlineItems = sortInlineMeta(snapshot.inlineItems || orderedItems);
                renderPreviewContent(modal);
                renderCustomList(modal);
                if (state.selectedInlineId) {
                    selectInlineItem(modal, state.selectedInlineId);
                }
            }
        } catch (error) {
            console.warn('Không thể cập nhật vị trí inline:', error);
        } finally {
            state.isSyncing = false;
            modal.classList.remove('is-syncing');
        }
    }

    function renderPreviewContent(modal) {
        const state = modal.__previewState;
        const previewContent = modal.querySelector('.preview-content');
        if (!state || !previewContent) return;
        previewContent.innerHTML = renderPreviewHTML(state.type, state.data);
        if (state.customEnabled && state.selectedInlineId) {
            highlightInlineBlock(modal, state.selectedInlineId);
        }
    }

    function showPreviewModal(type, data, options = {}) {
        const modal = ensurePreviewModal();
        modal.__previewState = {
            type,
            data,
            inlineItems: sortInlineMeta(options.inlineItems || []),
            applyInlineOrder: typeof options.applyInlineOrder === 'function' ? options.applyInlineOrder : null,
            customEnabled: false,
            selectedInlineId: null
        };
        renderPreviewContent(modal);
        updateCustomModeUi(modal);
        modal.classList.add('is-active');
    }

    function navigateToDashboard() {
        window.location.href = 'admin.html';
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

    function parsePositionValue(value) {
        if (value === undefined || value === null || value === '') {
            return null;
        }
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    }

    const hasInlinePositionValue = (item) => typeof parsePositionValue(item?.position) === 'number';

    const BLOG_MEDIA_TYPES = [
        { value: 'cover', label: 'Ảnh bìa' },
        { value: 'body', label: 'Ảnh nội dung' },
        { value: 'inline', label: 'Ảnh chèn' },
        { value: 'quote', label: 'Ảnh trích dẫn' },
        { value: 'gallery', label: 'Ảnh gallery' }
    ];

    const BLOG_VIDEO_TYPES = [
        { value: 'hero', label: 'Video mở đầu' },
        { value: 'body', label: 'Video nội dung' },
        { value: 'demo', label: 'Video demo' },
        { value: 'interview', label: 'Video phỏng vấn' }
    ];

    const PRODUCT_MEDIA_TYPES = [
        { value: 'hero', label: 'Ảnh hero' },
        { value: 'gallery', label: 'Ảnh gallery' },
        { value: 'body', label: 'Ảnh chi tiết' },
        { value: 'detail', label: 'Ảnh tính năng' }
    ];

    const PRODUCT_VIDEO_TYPES = [
        { value: 'hero', label: 'Video hero' },
        { value: 'demo', label: 'Video demo' },
        { value: 'body', label: 'Video nội dung' },
        { value: 'testimonial', label: 'Video khách hàng' }
    ];

    const buildTypeLabelMap = (items = []) =>
        items.reduce((acc, entry) => {
            acc[entry.value] = entry.label;
            return acc;
        }, {});

    const mapRepeaterItemsForPreview = (items = [], sourceKey, keepMeta = false) =>
        (items || []).map((item) => {
            const { __clientId, ...rest } = item;
            if (!keepMeta) {
                return rest;
            }
            return {
                ...rest,
                __clientId,
                __inlineSource: sourceKey
            };
        });

    const buildInlineMetaList = (items = [], { sourceKey, kind, labelMap }) =>
        (items || [])
            .filter((item) => hasInlinePositionValue(item))
            .map((item) => ({
                clientId: item.__clientId,
                sourceKey,
                kind,
                label: labelMap[item.type] || (kind === 'video' ? 'Video' : 'Ảnh chèn'),
                caption: item.caption || '',
                url: item.url || '',
                position: parsePositionValue(item.position) ?? 0
            }));

    function createRepeaterManager({ listSelector, addBtnSelector, buildRow }) {
        const listEl = document.querySelector(listSelector);
        const addBtn = document.querySelector(addBtnSelector);
        if (!listEl || !addBtn || typeof buildRow !== 'function') {
            return null;
        }

        const rowRegistry = new Map();

        function registerRow(row, data = {}) {
            const providedId = data.__clientId || row.dataset.repeaterId;
            const rowId = providedId || generateClientId();
            row.dataset.repeaterId = rowId;
            row.__clientId = rowId;
            rowRegistry.set(rowId, row);
        }

        function addItem(data = {}) {
            const row = buildRow({ ...data });
            if (!row) return;
            row.dataset.repeaterItem = 'true';
            registerRow(row, data);
            const removeBtn = row.querySelector('[data-remove-row]');
            if (removeBtn) {
                removeBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    rowRegistry.delete(row.dataset.repeaterId);
                    row.remove();
                });
            }
            listEl.appendChild(row);
        }

        addBtn.addEventListener('click', (event) => {
            event.preventDefault();
            addItem();
        });

        return {
            addItem,
            clear() {
                rowRegistry.clear();
                listEl.innerHTML = '';
            },
            setItems(items = []) {
                rowRegistry.clear();
                listEl.innerHTML = '';
                items.forEach((item) => addItem(item));
            },
            getItems(options = {}) {
                const includeMeta = Boolean(options.includeMeta);
                return Array.from(listEl.querySelectorAll('[data-repeater-item]'))
                    .map((row) => {
                        const value = typeof row.__getValue === 'function' ? row.__getValue() : null;
                        if (!value) return null;
                        if (includeMeta) {
                            return {
                                ...value,
                                __clientId: row.dataset.repeaterId || null
                            };
                        }
                        return value;
                    })
                    .filter(Boolean);
            },
            setInlinePosition(clientId, position) {
                const row = rowRegistry.get(clientId);
                if (!row || typeof row.__setInlinePosition !== 'function') {
                    return false;
                }
                row.__setInlinePosition(position);
                return true;
            }
        };
    }

    function buildMediaRow({ title, typeOptions, defaultType, urlPlaceholder, captionPlaceholder, data = {} }) {
        const row = document.createElement('div');
        row.className = 'media-row';
        row.innerHTML = `
            <div class="media-row__header">
                <strong>${title}</strong>
                <button type="button" class="media-row__remove" data-remove-row>
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="media-row__fields">
                <div class="form-control">
                    <label>Loại</label>
                    <select class="media-type"></select>
                </div>
                <div class="form-control">
                    <label>URL</label>
                    <input type="url" class="media-url" placeholder="${urlPlaceholder || 'https://...'}">
                </div>
                <div class="form-control">
                    <label>Chú thích</label>
                    <input type="text" class="media-caption" placeholder="${captionPlaceholder || 'Mô tả ngắn dưới ảnh/video'}">
                </div>
                <div class="form-control">
                    <label>Vị trí hiển thị</label>
                    <select class="media-placement-mode">
                        <option value="library">Chỉ hiển thị trong thư viện</option>
                        <option value="inline">Chèn vào nội dung bài viết</option>
                    </select>
                    <small class="input-hint">Chọn "Chèn vào nội dung" khi muốn ảnh/video xuất hiện xen giữa các đoạn văn.</small>
                </div>
                <div class="form-control media-position-group">
                    <label>Chèn sau đoạn số</label>
                    <div class="media-position-stepper">
                        <button type="button" class="stepper-btn" data-step="-1" aria-label="Giảm vị trí">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" min="0" class="media-position" placeholder="0">
                        <button type="button" class="stepper-btn" data-step="1" aria-label="Tăng vị trí">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="media-position-preview">
                        <span class="media-position-label">Trước đoạn đầu tiên</span>
                    </div>
                    <small class="input-hint">0 = Trước đoạn đầu tiên, 1 = Sau đoạn 1, 2 = Sau đoạn 2...</small>
                </div>
            </div>
        `;

        const typeSelect = row.querySelector('.media-type');
        typeOptions.forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.label;
            typeSelect.appendChild(opt);
        });
        typeSelect.value = typeOptions.some((opt) => opt.value === data.type)
            ? data.type
            : defaultType;

        row.querySelector('.media-url').value = data.url || '';
        row.querySelector('.media-caption').value = data.caption || '';
        const placementSelect = row.querySelector('.media-placement-mode');
        const positionGroup = row.querySelector('.media-position-group');
        const positionInput = row.querySelector('.media-position');
        const positionLabel = row.querySelector('.media-position-label');
        const stepButtons = row.querySelectorAll('.media-position-stepper .stepper-btn');

        const hasInlinePosition =
            typeof data.position === 'number' && Number.isFinite(data.position) && data.position >= 0;

        placementSelect.value = hasInlinePosition ? 'inline' : 'library';
        positionInput.value = hasInlinePosition ? data.position : '';

        const formatPositionText = (value) =>
            value <= 0 ? 'Trước đoạn đầu tiên' : `Sau đoạn ${value}`;

        const updatePositionLabel = () => {
            const parsed = parsePositionValue(positionInput.value);
            positionLabel.textContent = formatPositionText(parsed ?? 0);
        };

        const syncPlacementState = ({ skipReset } = {}) => {
            const inlineMode = placementSelect.value === 'inline';
            positionGroup.classList.toggle('is-hidden', !inlineMode);
            positionInput.disabled = !inlineMode;
            if (!inlineMode && !skipReset) {
                positionInput.value = '';
            }
            updatePositionLabel();
        };

        placementSelect.addEventListener('change', () => {
            syncPlacementState();
        });

        positionInput.addEventListener('focus', () => {
            if (placementSelect.value !== 'inline') {
                placementSelect.value = 'inline';
                syncPlacementState({ skipReset: true });
            }
        });

        positionInput.addEventListener('input', () => {
            if (positionInput.value === '') {
                updatePositionLabel();
                return;
            }
            const parsed = parsePositionValue(positionInput.value);
            if (parsed === null) {
                const digits = positionInput.value.replace(/[^0-9]/g, '');
                if (!digits) {
                    positionInput.value = '';
                    updatePositionLabel();
                    return;
                }
                positionInput.value = Number.parseInt(digits, 10);
            } else {
                positionInput.value = parsed;
            }
            updatePositionLabel();
        });

        stepButtons.forEach((btn) => {
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                const step = Number.parseInt(btn.dataset.step, 10) || 0;
                placementSelect.value = 'inline';
                const current = parsePositionValue(positionInput.value) ?? 0;
                const nextValue = Math.max(0, current + step);
                positionInput.value = nextValue;
                syncPlacementState({ skipReset: true });
            });
        });

        syncPlacementState({ skipReset: true });
        updatePositionLabel();

        row.__getValue = () => {
            const url = row.querySelector('.media-url').value.trim();
            if (!url) return null;
            const inlineMode = placementSelect.value === 'inline';
            const inlinePosition = parsePositionValue(positionInput.value);
            return {
                url,
                type: row.querySelector('.media-type').value,
                caption: row.querySelector('.media-caption').value.trim(),
                position: inlineMode ? inlinePosition ?? 0 : null
            };
        };

        row.__setInlinePosition = (position) => {
            if (position === null || position === undefined) {
                placementSelect.value = 'library';
                positionInput.value = '';
                syncPlacementState();
                return;
            }
            const safeValue = Math.max(0, Number.parseInt(position, 10) || 0);
            placementSelect.value = 'inline';
            positionInput.value = safeValue;
            syncPlacementState({ skipReset: true });
        };

        return row;
    }

    function buildVideoRow({ title, typeOptions, defaultType, urlPlaceholder, captionPlaceholder, data = {} }) {
        return buildMediaRow({
            title,
            typeOptions,
            defaultType,
            urlPlaceholder: urlPlaceholder || 'https://www.youtube.com/embed/...',
            captionPlaceholder: captionPlaceholder || 'Mô tả video',
            data
        });
    }

    function buildSourceRow({ title, data = {} }) {
        const row = document.createElement('div');
        row.className = 'media-row media-row--compact';
        row.innerHTML = `
            <div class="media-row__header">
                <strong>${title}</strong>
                <button type="button" class="media-row__remove" data-remove-row>
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="media-row__fields media-row__fields--two">
                <div class="form-control">
                    <label>Mô tả nguồn</label>
                    <input type="text" class="source-label" placeholder="VD: Báo Công Thương">
                </div>
                <div class="form-control">
                    <label>URL nguồn</label>
                    <input type="url" class="source-url" placeholder="https://...">
                </div>
            </div>
        `;

        row.querySelector('.source-label').value = data.label || '';
        row.querySelector('.source-url').value = data.url || '';

        row.__getValue = () => {
            const url = row.querySelector('.source-url').value.trim();
            if (!url) return null;
            return {
                label: row.querySelector('.source-label').value.trim() || 'Nguồn tham khảo',
                url
            };
        };

        return row;
    }

    async function ensureSession() {
        try {
            const user = await api.currentUser();
            if (!user) {
                navigateToDashboard();
                return null;
            }
            if (userLabel) {
                userLabel.textContent = `Xin chào, ${user.displayName || user.username}`;
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

        const blogMediaLabelMap = buildTypeLabelMap(BLOG_MEDIA_TYPES);
        const blogVideoLabelMap = buildTypeLabelMap(BLOG_VIDEO_TYPES);

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

        const blogMediaRepeater = createRepeaterManager({
            listSelector: '#blogMediaList',
            addBtnSelector: '#addBlogMediaBtn',
            buildRow: (data) =>
                buildMediaRow({
                    title: 'Anh bo sung',
                    typeOptions: BLOG_MEDIA_TYPES,
                    defaultType: 'body',
                    urlPlaceholder: 'https://example.com/image.jpg',
                    captionPlaceholder: 'Mô tả ngắn dưới ảnh',
                    data
                })
        });

        const blogVideoRepeater = createRepeaterManager({
            listSelector: '#blogVideoList',
            addBtnSelector: '#addBlogVideoBtn',
            buildRow: (data) =>
                buildVideoRow({
                    title: 'Video',
                    typeOptions: BLOG_VIDEO_TYPES,
                    defaultType: 'body',
                    urlPlaceholder: 'https://www.youtube.com/embed/...',
                    captionPlaceholder: 'Mô tả video',
                    data
                })
        });

        const blogSourceRepeater = createRepeaterManager({
            listSelector: '#blogSourceList',
            addBtnSelector: '#addBlogSourceBtn',
            buildRow: (data) => buildSourceRow({ title: 'Nguồn', data })
        });

        function buildBlogPreviewSnapshot() {
            const galleryRaw = blogMediaRepeater?.getItems({ includeMeta: true }) || [];
            const videoRaw = blogVideoRepeater?.getItems({ includeMeta: true }) || [];
            const sourceLinks = blogSourceRepeater?.getItems() || [];

            const galleryMedia = mapRepeaterItemsForPreview(galleryRaw, 'galleryMedia', true);
            const videoItems = mapRepeaterItemsForPreview(videoRaw, 'videoItems', true);

            const data = {
                code: fields.code.value.trim(),
                title: fields.title.value.trim(),
                subtitle: fields.subtitle.value.trim(),
                category: fields.category.value.trim(),
                imageUrl: fields.image.value.trim(),
                publishedAt: fields.publishedAt.value,
                excerpt: fields.excerpt.value.trim(),
                content: fields.content.value,
                tags: parseCommaList(fields.tags.value),
                keywords: parseCommaList(fields.keywords.value),
                authorName: fields.author.value.trim(),
                authorRole: fields.authorRole.value.trim(),
                galleryMedia,
                videoItems,
                sourceLinks
            };

            const inlineItems = [
                ...buildInlineMetaList(galleryRaw, {
                    sourceKey: 'galleryMedia',
                    kind: 'media',
                    labelMap: blogMediaLabelMap
                }),
                ...buildInlineMetaList(videoRaw, {
                    sourceKey: 'videoItems',
                    kind: 'video',
                    labelMap: blogVideoLabelMap
                })
            ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

            return { data, inlineItems };
        }

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
            blogMediaRepeater?.setItems(data.galleryMedia || []);
            blogVideoRepeater?.setItems(data.videoItems || []);
            blogSourceRepeater?.setItems(data.sourceLinks || []);
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
            blogMediaRepeater?.clear();
            blogVideoRepeater?.clear();
            blogSourceRepeater?.clear();
        }

        resetBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            resetForm();
        });

        previewBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            const code = fields.code.value.trim();
            if (!code) {
                showMessage('Vui lòng nhập mã bài viết trước khi xem trước.', 'error');
                return;
            }

            const snapshot = buildBlogPreviewSnapshot();
            showPreviewModal('blog', snapshot.data, {
                inlineItems: snapshot.inlineItems,
                applyInlineOrder: (orderedItems) => {
                    orderedItems.forEach((item, index) => {
                        const targetRepeater = item.sourceKey === 'videoItems' ? blogVideoRepeater : blogMediaRepeater;
                        targetRepeater?.setInlinePosition(item.clientId, index);
                    });
                    return buildBlogPreviewSnapshot();
                }
            });
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
                status: 'published',
                galleryMedia: blogMediaRepeater?.getItems() || [],
                videoItems: blogVideoRepeater?.getItems() || [],
                sourceLinks: blogSourceRepeater?.getItems() || []
            };

            if (!payload.code) {
                payload.code = generateCode('BLOG');
                fields.code.value = payload.code;
            }

            if (!payload.title || !payload.content) {
                showMessage('Tiêu đề và nội dung là bắt buộc.', 'error');
                return;
            }

            try {
                if (editingCode) {
                    await api.updateBlogPost(editingCode, payload);
                    showMessage('Đã cập nhật bài viết thành công.', 'success');
                } else {
                    await api.createBlogPost(payload);
                    showMessage('Đã tạo bài viết mới.', 'success');
                    editingCode = payload.code;
                    fields.code.disabled = true;
                }
                originalPayload = { ...payload };
                setTimeout(() => navigateToDashboard(), 1200);
            } catch (error) {
                showMessage(error.message || 'Không thể lưu bài viết.', 'error');
            }
        });

        if (editingCode) {
            setEditorState({
                title: 'Chỉnh sửa bài viết',
                subtitle: 'Cập nhật nội dung và thông tin bài viết.'
            });
            try {
                const blog = await api.fetchBlogPost(editingCode);
                if (!blog) {
                    showMessage('Không tìm thấy bài viết.', 'error');
                    fields.code.disabled = false;
                    editingCode = null;
                    resetForm();
                    return;
                }
                originalPayload = blog;
                fillForm(blog);
                fields.code.disabled = true;
                blogMediaRepeater?.setItems(blog.galleryMedia || []);
                blogVideoRepeater?.setItems(blog.videoItems || []);
                blogSourceRepeater?.setItems(blog.sourceLinks || []);
            } catch (error) {
                showMessage(error.message || 'Không thể tải bài viết.', 'error');
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

        const productMediaLabelMap = buildTypeLabelMap(PRODUCT_MEDIA_TYPES);
        const productVideoLabelMap = buildTypeLabelMap(PRODUCT_VIDEO_TYPES);

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

        const productMediaRepeater = createRepeaterManager({
            listSelector: '#productMediaList',
            addBtnSelector: '#addProductMediaBtn',
            buildRow: (data) =>
                buildMediaRow({
                    title: 'Anh san pham',
                    typeOptions: PRODUCT_MEDIA_TYPES,
                    defaultType: 'gallery',
                    urlPlaceholder: 'https://example.com/image.jpg',
                    captionPlaceholder: 'Mô tả ngắn về ảnh',
                    data
                })
        });

        const productVideoRepeater = createRepeaterManager({
            listSelector: '#productVideoList',
            addBtnSelector: '#addProductVideoBtn',
            buildRow: (data) =>
                buildVideoRow({
                    title: 'Video demo',
                    typeOptions: PRODUCT_VIDEO_TYPES,
                    defaultType: 'demo',
                    urlPlaceholder: 'https://www.youtube.com/embed/...',
                    captionPlaceholder: 'Mô tả video',
                    data
                })
        });

        function buildProductPreviewSnapshot() {
            const galleryRaw = productMediaRepeater?.getItems({ includeMeta: true }) || [];
            const videoRaw = productVideoRepeater?.getItems({ includeMeta: true }) || [];

            const data = {
                code: fields.code.value.trim(),
                name: fields.name.value.trim(),
                category: fields.category.value.trim(),
                imageUrl: fields.image.value.trim(),
                shortDescription: fields.summary.value.trim(),
                description: fields.description.value,
                featureTags: parseCommaList(fields.features.value),
                highlights: parseLines(fields.highlights.value),
                galleryMedia: mapRepeaterItemsForPreview(galleryRaw, 'galleryMedia', true),
                videoItems: mapRepeaterItemsForPreview(videoRaw, 'videoItems', true)
            };

            const inlineItems = [
                ...buildInlineMetaList(galleryRaw, {
                    sourceKey: 'galleryMedia',
                    kind: 'media',
                    labelMap: productMediaLabelMap
                }),
                ...buildInlineMetaList(videoRaw, {
                    sourceKey: 'videoItems',
                    kind: 'video',
                    labelMap: productVideoLabelMap
                })
            ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

            return { data, inlineItems };
        }

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
            productMediaRepeater?.setItems(data.galleryMedia || []);
            productVideoRepeater?.setItems(data.videoItems || []);
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
            productMediaRepeater?.clear();
            productVideoRepeater?.clear();
        }

        resetBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            resetForm();
        });

        previewBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            const code = fields.code.value.trim();
            if (!code) {
                showMessage('Vui lòng nhập mã sản phẩm trước khi xem trước.', 'error');
                return;
            }

            const snapshot = buildProductPreviewSnapshot();
            showPreviewModal('product', snapshot.data, {
                inlineItems: snapshot.inlineItems,
                applyInlineOrder: (orderedItems) => {
                    orderedItems.forEach((item, index) => {
                        const targetRepeater = item.sourceKey === 'videoItems' ? productVideoRepeater : productMediaRepeater;
                        targetRepeater?.setInlinePosition(item.clientId, index);
                    });
                    return buildProductPreviewSnapshot();
                }
            });
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
                galleryMedia: productMediaRepeater?.getItems() || [],
                videoItems: productVideoRepeater?.getItems() || [],
                status: 'active'
            };

            if (!payload.code) {
                payload.code = generateCode('PROD');
                fields.code.value = payload.code;
            }

            if (!payload.name || !payload.description) {
                showMessage('Tên sản phẩm và mô tả chi tiết là bắt buộc.', 'error');
                return;
            }

            try {
                if (editingCode) {
                    await api.updateProduct(editingCode, payload);
                    showMessage('Đã cập nhật sản phẩm thành công.', 'success');
                } else {
                    await api.createProduct(payload);
                    showMessage('Đã tạo sản phẩm mới.', 'success');
                    editingCode = payload.code;
                    fields.code.disabled = true;
                }
                originalPayload = { ...payload };
                setTimeout(() => navigateToDashboard(), 1200);
            } catch (error) {
                showMessage(error.message || 'Không thể lưu sản phẩm.', 'error');
            }
        });

        if (editingCode) {
            setEditorState({
                title: 'Chỉnh sửa sản phẩm',
                subtitle: 'Cập nhật nội dung và thông tin sản phẩm.'
            });
            try {
                const product = await api.fetchProduct(editingCode);
                if (!product) {
                    showMessage('Không tìm thấy sản phẩm.', 'error');
                    fields.code.disabled = false;
                    editingCode = null;
                    resetForm();
                    return;
                }
                originalPayload = product;
                fillForm(product);
                fields.code.disabled = true;
            } catch (error) {
                showMessage(error.message || 'Không thể tải sản phẩm.', 'error');
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
                    passwordHint.textContent = 'Để trống để giữ nguyên mật khẩu cũ.';
                }
                return;
            }
            userForm?.reset();
            fields.username.disabled = false;
            fields.password.required = true;
            if (passwordHint) {
                passwordHint.textContent = 'Tối thiểu 8 ký tự.';
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
                showMessage('Tên đăng nhập và tên hiển thị là bắt buộc.', 'error');
                return;
            }

            const passwordValue = fields.password.value.trim();
            if (editingId) {
                if (passwordValue) {
                    if (passwordValue.length < 8) {
                        showMessage('Mật khẩu phải có ít nhất 8 ký tự.', 'error');
                        return;
                    }
                    payload.password = passwordValue;
                }
                try {
                    await api.updateUser(editingId, payload);
                    showMessage('Đã cập nhật người dùng.', 'success');
                    setTimeout(() => navigateToDashboard(), 1000);
                } catch (error) {
                    showMessage(error.message || 'Không thể cập nhật người dùng.', 'error');
                }
            } else {
                if (!passwordValue || passwordValue.length < 8) {
                    showMessage('Vui lòng nhập mật khẩu tối thiểu 8 ký tự.', 'error');
                    return;
                }
                payload.password = passwordValue;
                try {
                    await api.createUser(payload);
                    showMessage('Đã tạo người dùng mới.', 'success');
                    setTimeout(() => navigateToDashboard(), 1000);
                } catch (error) {
                    showMessage(error.message || 'Không thể tạo người dùng.', 'error');
                }
            }
        });

        if (editingId) {
            setEditorState({
                title: 'Chỉnh sửa người dùng',
                subtitle: 'Cập nhật vai trò và thông tin người dùng.'
            });
            try {
                const user = await api.fetchUser(editingId);
                if (!user) {
                    showMessage('Không tìm thấy người dùng.', 'error');
                    resetForm();
                    return;
                }
                originalPayload = user;
                resetForm();
            } catch (error) {
                showMessage(error.message || 'Không thể tải người dùng.', 'error');
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
