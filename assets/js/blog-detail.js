document.addEventListener('DOMContentLoaded', async () => {
    if (!window.covasolApi) {
        console.warn('Covasol API helper is not available.');
        return;
    }

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

    function splitParagraphs(content) {
        if (!content) {
            return ['Noi dung bai viet dang duoc cap nhat.'];
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
        if (!relatedListEl) {
            return;
        }

        relatedListEl.innerHTML = '<li>Dang tai bai viet lien quan...</li>';
        try {
            const posts = await window.covasolApi.fetchBlogPosts({
                limit: 4,
                offset: 0,
                tag: category || undefined
            });

            relatedListEl.innerHTML = '';
            posts
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
                relatedListEl.innerHTML = '<li>Chua co bai viet lien quan.</li>';
            }
        } catch (error) {
            console.error('Khong the tai bai viet lien quan:', error);
            relatedListEl.innerHTML = '<li>Khong tai duoc danh sach lien quan.</li>';
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

        categoryEl.textContent = article.category || 'Tin tuc';
        authorEl.textContent = article.authorName || 'COVASOL Team';
        authorRoleEl.textContent = article.authorRole || 'Chuyen gia noi dung';
        dateEl.textContent = formatDate(article.publishedAt);
        coverEl.src =
            article.imageUrl ||
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80';
        coverEl.alt = article.title;

        bodyEl.innerHTML = '';
        splitParagraphs(article.content).forEach((paragraph) => {
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

    function showError(message) {
        console.error('Khong the tai bai viet:', message);
        bodyEl.innerHTML = `
            <div class="article-error">
                <h2>Khong tim thay bai viet</h2>
                <p>${message || 'Vui long quay lai trang blog de chon bai viet khac.'}</p>
                <a class="btn btn-primary" href="blog.html">Quay lai Blog</a>
            </div>
        `;
        tagsEl.style.display = 'none';
        keywordsEl.style.display = 'none';
        if (relatedListEl) {
            relatedListEl.innerHTML = '<li>Khong co du lieu.</li>';
        }
        document.title = 'Khong tim thay bai viet | COVASOL';
    }

    try {
        const identifier = resolveIdentifier();
        if (!identifier) {
            throw new Error('Khong xac dinh duoc ma bai viet.');
        }

        const payload = await window.covasolApi.fetchBlogPost(identifier);
        renderArticle(payload);
    } catch (error) {
        showError(error?.message);
    }
});

