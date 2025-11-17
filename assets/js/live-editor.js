/**
 * COVASOL Live Editor
 * Real-time preview editor cho blog posts và products
 */

document.addEventListener('DOMContentLoaded', () => {
    const api = window.covasolApi;
    const previewRenderers = window.covasolPreview;

    if (!api || !previewRenderers) {
        console.error('Dependencies missing for live editor');
        return;
    }

    const editorType = document.body.dataset.liveEditor;
    if (!editorType) return;

    const params = new URLSearchParams(window.location.search);
    let editingId = params.get('code') || params.get('id');

    // DOM elements
    const contentEditor = document.getElementById('liveContentEditor');
    const previewPane = document.getElementById('livePreviewPane');
    const saveBtn = document.getElementById('liveSaveBtn');
    const toolbar = document.getElementById('editorToolbar');

    // State
    let editorState = {
        code: '',
        title: '',
        subtitle: '',
        category: '',
        imageUrl: '',
        publishedAt: null,
        excerpt: '',
        content: '',
        tags: [],
        keywords: [],
        authorName: '',
        authorRole: '',
        primaryCTA: '',
        primaryCTAUrl: '',
        inlineMedia: [],
        sourceLinks: [],
        status: 'draft'
    };

    let cursorPosition = 0;
    let isDirty = false;
    const isProduct = editorType === 'product';

    // Generate code if not provided
    const generateCode = (prefix) => {
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
    };

    // Utility functions
    const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const escapeHtml = (str = '') =>
        String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const debounce = (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    // Content parsing
    function parseContentBlocks(text = '') {
        const normalized = text.replace(/\r\n/g, '\n');
        return normalized
            .split(/\n{2,}/)
            .map((block) => block.trim())
            .filter(Boolean);
    }

    function calculateCursorParagraph() {
        if (!contentEditor) return 0;
        const text = contentEditor.value;
        const beforeCursor = text.substring(0, contentEditor.selectionStart);
        const blocks = parseContentBlocks(beforeCursor);
        return blocks.length;
    }

    // Inline media management
    function insertInlineMedia(type, url, caption = '') {
        if (!contentEditor) return;

        cursorPosition = calculateCursorParagraph();
        
        const mediaItem = {
            id: generateId(),
            type,
            url,
            caption,
            position: cursorPosition
        };

        editorState.inlineMedia.push(mediaItem);
        renderPreview();
        markDirty();

        // Show confirmation
        showNotification(`Đã chèn ${type === 'image' ? 'ảnh' : 'video'} sau đoạn ${cursorPosition}`, 'success');
    }

    function removeInlineMedia(id) {
        editorState.inlineMedia = editorState.inlineMedia.filter(item => item.id !== id);
        renderPreview();
        markDirty();
    }

    function updateInlineMediaPosition(id, newPosition) {
        const item = editorState.inlineMedia.find(m => m.id === id);
        if (item) {
            item.position = newPosition;
            renderPreview();
            markDirty();
        }
    }

    // Preview rendering
    function renderPreview() {
        if (!previewPane) return;

        const blocks = parseContentBlocks(editorState.content);
        const sortedMedia = [...editorState.inlineMedia].sort((a, b) => a.position - b.position);

        let html = '';

        // Header section
        html += `
            <div class="live-preview-header">
                <h1>${escapeHtml(editorState.title) || '<span class="placeholder">Tiêu đề bài viết</span>'}</h1>
                ${editorState.subtitle ? `<p class="preview-subtitle">${escapeHtml(editorState.subtitle)}</p>` : ''}
                <div class="preview-meta">
                    ${editorState.category ? `<span class="meta-badge">${escapeHtml(editorState.category)}</span>` : ''}
                    ${editorState.authorName ? `<span class="meta-author">Bởi ${escapeHtml(editorState.authorName)}</span>` : ''}
                </div>
            </div>
        `;

        if (editorState.imageUrl) {
            html += `
                <div class="preview-hero-image">
                    <img src="${escapeHtml(editorState.imageUrl)}" alt="${escapeHtml(editorState.title)}" />
                </div>
            `;
        }

        if (editorState.excerpt) {
            html += `<p class="preview-excerpt">${escapeHtml(editorState.excerpt)}</p>`;
        }

        // Content with inline media
        html += '<div class="live-preview-body">';
        
        let mediaIndex = 0;
        
        // Insert media before first paragraph (position 0)
        while (mediaIndex < sortedMedia.length && sortedMedia[mediaIndex].position === 0) {
            html += renderMediaBlock(sortedMedia[mediaIndex]);
            mediaIndex++;
        }

        blocks.forEach((block, index) => {
            const paragraphNumber = index + 1;
            html += `<div class="preview-paragraph" data-paragraph="${paragraphNumber}">${escapeHtml(block).replace(/\n/g, '<br>')}</div>`;
            
            // Insert media after this paragraph
            while (mediaIndex < sortedMedia.length && sortedMedia[mediaIndex].position === paragraphNumber) {
                html += renderMediaBlock(sortedMedia[mediaIndex]);
                mediaIndex++;
            }
        });

        // Remaining media at the end
        while (mediaIndex < sortedMedia.length) {
            html += renderMediaBlock(sortedMedia[mediaIndex]);
            mediaIndex++;
        }

        html += '</div>';

        // Source links
        if (!isProduct && editorState.sourceLinks.length > 0) {
            html += '<div class="preview-sources">';
            html += '<h4>Nguồn tham khảo</h4>';
            html += '<ul>';
            editorState.sourceLinks.forEach(source => {
                html += `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label || 'Nguồn tham khảo')}</a></li>`;
            });
            html += '</ul>';
            html += '</div>';
        }

        // Tags
        if (editorState.tags.length > 0) {
            html += '<div class="preview-tags">';
            editorState.tags.forEach(tag => {
                html += `<span class="preview-tag">${escapeHtml(tag)}</span>`;
            });
            html += '</div>';
        }

        previewPane.innerHTML = html;

        // Setup media controls
        setupMediaControls();
    }

    function renderMediaBlock(media) {
        if (media.type === 'image') {
            return `
                <figure class="live-inline-media" data-media-id="${escapeHtml(media.id)}">
                    <div class="media-controls">
                        <button type="button" class="media-control-btn" data-action="move-up" title="Di chuyển lên">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" class="media-control-btn" data-action="move-down" title="Di chuyển xuống">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" class="media-control-btn media-control-remove" data-action="remove" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.caption || 'Image')}" />
                    ${media.caption ? `<figcaption>${escapeHtml(media.caption)}</figcaption>` : ''}
                    <div class="media-position-indicator">Sau đoạn ${media.position}</div>
                </figure>
            `;
        } else if (media.type === 'video') {
            return `
                <div class="live-inline-media live-inline-video" data-media-id="${escapeHtml(media.id)}">
                    <div class="media-controls">
                        <button type="button" class="media-control-btn" data-action="move-up" title="Di chuyển lên">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button type="button" class="media-control-btn" data-action="move-down" title="Di chuyển xuống">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button type="button" class="media-control-btn media-control-remove" data-action="remove" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="video-embed">
                        <iframe src="${escapeHtml(media.url)}" allowfullscreen></iframe>
                    </div>
                    ${media.caption ? `<p class="video-caption">${escapeHtml(media.caption)}</p>` : ''}
                    <div class="media-position-indicator">Sau đoạn ${media.position}</div>
                </div>
            `;
        }
        return '';
    }

    function setupMediaControls() {
        const mediaBlocks = previewPane.querySelectorAll('.live-inline-media');
        
        mediaBlocks.forEach(block => {
            const mediaId = block.dataset.mediaId;
            const controls = block.querySelectorAll('.media-control-btn');
            
            controls.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = btn.dataset.action;
                    const media = editorState.inlineMedia.find(m => m.id === mediaId);
                    
                    if (!media) return;
                    
                    switch (action) {
                        case 'move-up':
                            if (media.position > 0) {
                                updateInlineMediaPosition(mediaId, media.position - 1);
                            }
                            break;
                        case 'move-down':
                            updateInlineMediaPosition(mediaId, media.position + 1);
                            break;
                        case 'remove':
                            if (confirm('Xóa ảnh/video này?')) {
                                removeInlineMedia(mediaId);
                            }
                            break;
                    }
                });
            });
        });
    }

    // Toolbar actions
    function setupToolbar() {
        if (!toolbar) return;

        const insertImageBtn = toolbar.querySelector('[data-action="insert-image"]');
        const insertVideoBtn = toolbar.querySelector('[data-action="insert-video"]');
        const insertSourceBtn = toolbar.querySelector('[data-action="insert-source"]');

        insertImageBtn?.addEventListener('click', () => {
            showMediaModal('image');
        });

        insertVideoBtn?.addEventListener('click', () => {
            showMediaModal('video');
        });

        insertSourceBtn?.addEventListener('click', () => {
            showSourceModal();
        });
    }

    function showMediaModal(type) {
        const modal = document.createElement('div');
        modal.className = 'media-insert-modal';
        modal.innerHTML = `
            <div class="media-modal-content">
                <div class="modal-header">
                    <h3>Chèn ${type === 'image' ? 'ảnh' : 'video'}</h3>
                    <button type="button" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-control">
                        <label>URL ${type === 'image' ? 'ảnh' : 'video'}</label>
                        <input type="url" id="mediaUrl" placeholder="https://" required />
                    </div>
                    <div class="form-control">
                        <label>Chú thích (tùy chọn)</label>
                        <input type="text" id="mediaCaption" placeholder="Mô tả ngắn" />
                    </div>
                    <div class="form-control">
                        <label>Vị trí chèn</label>
                        <p class="hint">Sẽ chèn sau đoạn số <strong>${cursorPosition}</strong> (vị trí con trỏ hiện tại)</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-ghost modal-cancel">Hủy</button>
                    <button type="button" class="btn btn-primary modal-confirm">Chèn</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        const confirmBtn = modal.querySelector('.modal-confirm');
        const urlInput = modal.querySelector('#mediaUrl');
        const captionInput = modal.querySelector('#mediaCaption');

        const closeModal = () => modal.remove();

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (!url) {
                alert('Vui lòng nhập URL');
                return;
            }
            
            insertInlineMedia(type, url, captionInput.value.trim());
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        setTimeout(() => urlInput.focus(), 100);
    }

    function showSourceModal() {
        const modal = document.createElement('div');
        modal.className = 'media-insert-modal';
        modal.innerHTML = `
            <div class="media-modal-content">
                <div class="modal-header">
                    <h3>Thêm nguồn tham khảo</h3>
                    <button type="button" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-control">
                        <label>Tên nguồn</label>
                        <input type="text" id="sourceLabel" placeholder="VD: Báo Công Thương" required />
                    </div>
                    <div class="form-control">
                        <label>URL nguồn</label>
                        <input type="url" id="sourceUrl" placeholder="https://" required />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-ghost modal-cancel">Hủy</button>
                    <button type="button" class="btn btn-primary modal-confirm">Thêm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-cancel');
        const confirmBtn = modal.querySelector('.modal-confirm');
        const labelInput = modal.querySelector('#sourceLabel');
        const urlInput = modal.querySelector('#sourceUrl');

        const closeModal = () => modal.remove();

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', () => {
            const label = labelInput.value.trim();
            const url = urlInput.value.trim();
            
            if (!label || !url) {
                alert('Vui lòng nhập đầy đủ tên và URL nguồn');
                return;
            }
            
            editorState.sourceLinks.push({ label, url });
            renderPreview();
            markDirty();
            showNotification('Đã thêm nguồn tham khảo', 'success');
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        setTimeout(() => labelInput.focus(), 100);
    }

    // Content editor events
    function setupContentEditor() {
        if (!contentEditor) return;

        contentEditor.addEventListener('input', debounce(() => {
            editorState.content = contentEditor.value;
            renderPreview();
            markDirty();
        }, 300));

        contentEditor.addEventListener('click', () => {
            cursorPosition = calculateCursorParagraph();
        });

        contentEditor.addEventListener('keyup', () => {
            cursorPosition = calculateCursorParagraph();
        });
    }

    // Metadata fields
    function setupMetadataFields() {
        const fields = {
            title: document.getElementById('liveTitle'),
            subtitle: document.getElementById('liveSubtitle'),
            category: document.getElementById('liveCategory'),
            imageUrl: document.getElementById('liveImageUrl'),
            excerpt: document.getElementById('liveExcerpt'),
            tags: document.getElementById('liveTags'),
            authorName: document.getElementById('liveAuthorName'),
            authorRole: document.getElementById('liveAuthorRole'),
            primaryCTA: document.getElementById('livePrimaryCTA'),
            primaryCTAUrl: document.getElementById('livePrimaryCTAUrl')
        };

        Object.entries(fields).forEach(([key, field]) => {
            if (!field) return;
            
            field.addEventListener('input', debounce(() => {
                if (key === 'tags') {
                    editorState[key] = field.value
                        .split(',')
                        .map(t => t.trim())
                        .filter(Boolean);
                } else {
                    editorState[key] = field.value;
                }
                renderPreview();
                markDirty();
            }, 300));
        });
    }

    // Save functionality
    function setupSave() {
        if (!saveBtn) return;

        saveBtn.addEventListener('click', async () => {
            try {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

                // Generate code if not exists
                if (!editorState.code) {
                    editorState.code = generateCode(isProduct ? 'PROD' : 'BLOG');
                }

                // Validation
                if (!editorState.title || !editorState.content) {
                    showNotification('Vui lòng nhập tiêu đề và nội dung', 'error');
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = `<i class="fas fa-save"></i> Lưu ${isProduct ? 'sản phẩm' : 'bài viết'}`;
                    return;
                }

                const payload = {
                    code: editorState.code,
                    title: editorState.title,
                    subtitle: editorState.subtitle || null,
                    category: editorState.category || null,
                    imageUrl: editorState.imageUrl || null,
                    excerpt: editorState.excerpt || null,
                    content: editorState.content,
                    tags: editorState.tags || [],
                    keywords: editorState.keywords || [],
                    status: 'published',
                    galleryMedia: editorState.inlineMedia.filter(m => m.type === 'image').map(m => ({
                        type: isProduct ? 'gallery' : 'inline',
                        url: m.url,
                        caption: m.caption,
                        position: m.position
                    })),
                    videoItems: editorState.inlineMedia.filter(m => m.type === 'video').map(m => ({
                        type: 'body',
                        url: m.url,
                        caption: m.caption,
                        position: m.position
                    })),
                    sourceLinks: editorState.sourceLinks || []
                };

                if (isProduct) {
                    payload.name = payload.title;
                    payload.shortDescription = payload.excerpt;
                    payload.description = payload.content;
                    payload.featureTags = payload.tags;
                    payload.ctaPrimary = {
                        label: editorState.primaryCTA || null,
                        url: editorState.primaryCTAUrl || null
                    };
                    delete payload.title;
                    delete payload.excerpt;
                    delete payload.tags;
                    delete payload.authorName;
                    delete payload.authorRole;
                    delete payload.publishedAt;
                    delete payload.sourceLinks;

                    if (editingId) {
                        await api.updateProduct(editingId, payload);
                        showNotification('Đã cập nhật sản phẩm', 'success');
                    } else {
                        const result = await api.createProduct(payload);
                        editingId = result.code;
                        showNotification('Đã tạo sản phẩm mới', 'success');
                    }
                } else {
                    payload.authorName = editorState.authorName || null;
                    payload.authorRole = editorState.authorRole || null;
                    payload.publishedAt = editorState.publishedAt || new Date().toISOString();
                    
                    if (editingId) {
                        await api.updateBlogPost(editingId, payload);
                        showNotification('Đã cập nhật bài viết', 'success');
                    } else {
                        const result = await api.createBlogPost(payload);
                        editingId = result.code;
                        editorState.code = result.code;
                        showNotification('Đã tạo bài viết mới', 'success');
                    }
                }

                isDirty = false;
                updateSaveButton();
            } catch (error) {
                showNotification(error.message || 'Lỗi khi lưu', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = `<i class="fas fa-save"></i> Lưu ${isProduct ? 'sản phẩm' : 'bài viết'}`;
            }
        });
    }

    function markDirty() {
        isDirty = true;
        updateSaveButton();
    }

    function updateSaveButton() {
        if (!saveBtn) return;
        saveBtn.classList.toggle('btn-primary', isDirty);
        saveBtn.classList.toggle('btn-outline', !isDirty);
    }

    // Notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `live-notification live-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Load existing content
    async function loadExistingContent() {
        if (!editingId) {
            renderPreview();
            return;
        }

        try {
            const data = isProduct 
                ? await api.fetchProduct(editingId)
                : await api.fetchBlogPost(editingId);
            
            editorState = {
                code: data.code,
                title: isProduct ? data.name : data.title,
                subtitle: data.subtitle || '',
                category: data.category || '',
                imageUrl: data.imageUrl || '',
                publishedAt: data.publishedAt,
                excerpt: isProduct ? data.shortDescription : data.excerpt || '',
                content: isProduct ? data.description : data.content || '',
                tags: isProduct ? (data.featureTags || []) : (data.tags || []),
                keywords: data.keywords || [],
                authorName: data.authorName || '',
                authorRole: data.authorRole || '',
                primaryCTA: data.ctaPrimary?.label || '',
                primaryCTAUrl: data.ctaPrimary?.url || '',
                sourceLinks: data.sourceLinks || [],
                inlineMedia: [
                    ...(data.galleryMedia || []).map(m => ({
                        id: generateId(),
                        type: 'image',
                        url: m.url,
                        caption: m.caption || '',
                        position: m.position ?? 999
                    })),
                    ...(data.videoItems || []).map(m => ({
                        id: generateId(),
                        type: 'video',
                        url: m.url,
                        caption: m.caption || '',
                        position: m.position ?? 999
                    }))
                ],
                status: data.status || 'draft'
            };

            // Populate fields
            if (contentEditor) contentEditor.value = editorState.content;
            const titleField = document.getElementById('liveTitle');
            const subtitleField = document.getElementById('liveSubtitle');
            const categoryField = document.getElementById('liveCategory');
            const imageField = document.getElementById('liveImageUrl');
            const excerptField = document.getElementById('liveExcerpt');
            const tagsField = document.getElementById('liveTags');
            const authorNameField = document.getElementById('liveAuthorName');
            const authorRoleField = document.getElementById('liveAuthorRole');
            const primaryCTAField = document.getElementById('livePrimaryCTA');
            const primaryCTAUrlField = document.getElementById('livePrimaryCTAUrl');

            if (titleField) titleField.value = editorState.title;
            if (subtitleField) subtitleField.value = editorState.subtitle;
            if (categoryField) categoryField.value = editorState.category;
            if (imageField) imageField.value = editorState.imageUrl;
            if (excerptField) excerptField.value = editorState.excerpt;
            if (tagsField) tagsField.value = editorState.tags.join(', ');
            if (authorNameField) authorNameField.value = editorState.authorName;
            if (authorRoleField) authorRoleField.value = editorState.authorRole;
            if (primaryCTAField) primaryCTAField.value = editorState.primaryCTA;
            if (primaryCTAUrlField) primaryCTAUrlField.value = editorState.primaryCTAUrl;

            renderPreview();
        } catch (error) {
            showNotification(`Không thể tải ${isProduct ? 'sản phẩm' : 'bài viết'}`, 'error');
        }
    }

    // Initialize
    async function init() {
        setupToolbar();
        setupContentEditor();
        setupMetadataFields();
        setupSave();
        await loadExistingContent();
        
        // Warn on unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi?';
            }
        });
    }

    init();
});
