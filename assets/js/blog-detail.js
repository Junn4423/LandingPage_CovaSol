document.addEventListener('DOMContentLoaded', async () => {
    if (!window.covasolApi) {
        console.warn('Covasol API helper is not available.');
        return;
    }

    const identifier = decodeURIComponent(window.location.pathname.split('/').pop());
    const titleEl = document.getElementById('articleTitle');
    const subtitleEl = document.getElementById('articleSubtitle');
    const categoryEl = document.getElementById('articleCategory');
    const authorEl = document.getElementById('articleAuthor');
    const authorRoleEl = document.getElementById('articleAuthorRole');
    const dateEl = document.getElementById('articleDate');
    const coverEl = document.getElementById('articleCover');
    const bodyEl = document.getElementById('articleBody');
    const tagsEl = document.getElementById('articleTags');
    const keywordsEl = document.getElementById('articleKeywords');
    const relatedListEl = document.getElementById('relatedPosts');

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

    function renderParagraphs(content) {
        if (!content) {
            return ['Nội dung đang được cập nhật.'];
        }
        return content
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
    }

    function renderTags(container, values) {
        container.innerHTML = '';
        if (!values || !values.length) {
            container.style.display = 'none';
            return;
        }
        container.style.display = '';
        values.forEach((value) => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = value;
            container.appendChild(tag);
        });
    }

    async function loadRelatedPosts(currentCode, category) {
        try {
            const posts = await window.covasolApi.fetchBlogPosts({
                limit: 4,
                offset: 0,
                category: category || undefined
            });
            relatedListEl.innerHTML = '';
            posts
                .filter((post) => post.code !== currentCode)
                .slice(0, 3)
                .forEach((post) => {
                    const item = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `/blog/post/${encodeURIComponent(post.code)}`;
                    link.textContent = post.title;

                    const meta = document.createElement('span');
                    meta.textContent = formatDate(post.publishedAt);

                    item.appendChild(link);
                    item.appendChild(meta);
                    relatedListEl.appendChild(item);
                });
        } catch (error) {
            console.error('Không thể tải bài viết liên quan:', error);
            relatedListEl.innerHTML = '<li>Không thể tải bài viết liên quan.</li>';
        }
    }

    function renderArticle(article) {
        titleEl.textContent = article.title;
        if (article.subtitle) {
            subtitleEl.textContent = article.subtitle;
            subtitleEl.style.display = '';
        } else {
            subtitleEl.style.display = 'none';
        }

        categoryEl.textContent = article.category || 'Tin tức';
        authorEl.textContent = article.authorName || 'COVASOL Team';
        authorRoleEl.textContent = article.authorRole || 'Chuyên gia nội dung';
        dateEl.textContent = formatDate(article.publishedAt);
        coverEl.src =
            article.imageUrl ||
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80';
        coverEl.alt = article.title;

        bodyEl.innerHTML = '';
        renderParagraphs(article.content).forEach((paragraph) => {
            if (paragraph.startsWith('##')) {
                const heading = document.createElement('h3');
                heading.textContent = paragraph.replace(/^#+\s*/, '');
                bodyEl.appendChild(heading);
            } else if (paragraph.startsWith('#')) {
                const heading = document.createElement('h2');
                heading.textContent = paragraph.replace(/^#+\s*/, '');
                bodyEl.appendChild(heading);
            } else {
                const p = document.createElement('p');
                p.textContent = paragraph;
                bodyEl.appendChild(p);
            }
        });

        renderTags(tagsEl, article.tags);
        renderTags(keywordsEl, article.keywords);

        document.title = `${article.title} | COVASOL`;

        loadRelatedPosts(article.code, article.category);
    }

    try {
        const payload = await window.covasolApi.fetchBlogPost(identifier);
        renderArticle(payload);
    } catch (error) {
        console.error('Không thể tải bài viết:', error);
        bodyEl.innerHTML = `
            <div class="article-error">
                <h2>Không tìm thấy bài viết</h2>
                <p>${error.message || 'Vui lòng quay lại trang blog để chọn bài viết khác.'}</p>
                <a class="btn btn-primary" href="/blog.html">Quay lại Blog</a>
            </div>
        `;
        document.title = 'Không tìm thấy bài viết | COVASOL';
        tagsEl.style.display = 'none';
        keywordsEl.style.display = 'none';
        if (relatedListEl) {
            relatedListEl.innerHTML = '<li>Không có dữ liệu hiển thị.</li>';
        }
    }
});
