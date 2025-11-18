document.addEventListener('DOMContentLoaded', async () => {
    const api = window.covasolApi;
    if (!api) {
        console.warn('Covasol API helper is not available.');
        return;
    }

    const previewEl = document.getElementById('articlePreview');
    const relatedListEl = document.getElementById('relatedPosts');
    const previewRenderer = window.covasolPreview?.renderBlogPreview;

    function resolveIdentifier() {
        const params = new URLSearchParams(window.location.search);
        const fromQuery =
            params.get('code') || params.get('id') || params.get('blog');
        if (fromQuery && fromQuery.trim()) {
            return decodeURIComponent(fromQuery.trim());
        }

        const parts = window.location.pathname.replace(/\/+$/, '').split('/');
        while (parts.length && !parts[parts.length - 1]) {
            parts.pop();
        }

        const last = parts.pop();
        if (!last || last.toLowerCase().endsWith('.html')) {
            return null;
        }

        return decodeURIComponent(last);
    }

    function formatDate(value) {
        try {
            return new Date(value).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return value;
        }
    }

    const isPublishedArticle = (article) =>
        (article?.status || 'draft').toLowerCase() === 'published';

    function renderFallback(article) {
        const content = article.content
            ? article.content
                  .split(/\n{2,}/)
                  .map((paragraph) => `<p>${paragraph}</p>`)
                  .join('')
            : '<p>Khong co noi dung</p>';

        return `
            <h1>${article.title || 'Khong co tieu de'}</h1>
            ${article.subtitle ? `<p class="preview-subtitle">${article.subtitle}</p>` : ''}
            <div class="preview-meta">
                ${article.category ? `<span><strong>Danh muc:</strong> ${article.category}</span>` : ''}
                <span><strong>Ngay:</strong> ${formatDate(article.publishedAt)}</span>
                ${
                    article.authorName
                        ? `<span><strong>Tac gia:</strong> ${article.authorName}${
                              article.authorRole ? ' - ' + article.authorRole : ''
                          }</span>`
                        : ''
                }
            </div>
            ${content}
        `;
    }

    async function loadRelatedPosts(currentCode, category) {
        if (!relatedListEl) {
            return;
        }

        relatedListEl.innerHTML = '<li>Dang tai bai viet lien quan...</li>';
        try {
            const posts = await api.fetchBlogPosts({
                limit: 4,
                offset: 0,
                tag: category || undefined,
                status: 'published'
            });

            relatedListEl.innerHTML = '';
            const visiblePosts = (posts || []).filter(isPublishedArticle);
            visiblePosts
                .filter((post) => post.code !== currentCode)
                .slice(0, 3)
                .forEach((post) => {
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `blog-detail.html?code=${encodeURIComponent(post.code)}`;
                    link.textContent = post.title;

                    const meta = document.createElement('span');
                    meta.textContent = formatDate(post.publishedAt);

                    item.appendChild(link);
                    item.appendChild(meta);
                    relatedListEl.appendChild(item);
                });

            if (!relatedListEl.children.length) {
                relatedListEl.innerHTML = '<li>Chưa có bài viết liên quan</li>';
            }
        } catch (error) {
            console.error('Không thể tải bài viết liên quan:', error);
            relatedListEl.innerHTML = '<li>Không tải được danh sách liên quan.</li>';
        }
    }

    function renderArticle(article) {
        if (!previewEl) {
            return;
        }

        if (!isPublishedArticle(article)) {
            showError('Bài viết này đang được ẩn hoặc chưa xuất bản.');
            return;
        }

        if (typeof previewRenderer === 'function') {
            previewEl.innerHTML = previewRenderer(article);
        } else {
            previewEl.innerHTML = renderFallback(article);
        }

        document.title = `${article.title || 'Blog'} | COVASOL`;
        loadRelatedPosts(article.code, article.category);
    }

    function showError(message) {
        if (previewEl) {
            previewEl.innerHTML = `
                <div class="article-error preview-error">
                    <h2>Không tìm thấy bài viết</h2>
                    <p>${message || 'Vui lòng quay lại trang blog để chọn bài viết khác.'}</p>
                    <a class="btn btn-primary" href="blog.html">Quay lại Blog</a>
                </div>
            `;
        }
        if (relatedListEl) {
            relatedListEl.innerHTML = '<li>Không có dữ liệu.</li>';
        }
        document.title = 'Không tìm thấy bài viết | COVASOL';
    }

    try {
        const identifier = resolveIdentifier();
        if (!identifier) {
            throw new Error('Không xác định được mã bài viết.');
        }

        const payload = await api.fetchBlogPost(identifier);
        renderArticle(payload);
    } catch (error) {
        showError(error?.message);
    }
});





