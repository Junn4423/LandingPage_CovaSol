document.addEventListener('DOMContentLoaded', () => {
    if (!window.covasolApi) {
        console.warn('Covasol API helper is not available.');
        return;
    }

    const postsGrid = document.querySelector('.blog-posts .posts-grid');
    const blogContainer = document.querySelector('.blog-posts .container');
    const loadMoreBtn = document.querySelector('.blog-posts .load-more-section .btn');
    const categoryButtons = Array.from(document.querySelectorAll('.blog-categories .category-btn'));

    if (!postsGrid || !blogContainer || !loadMoreBtn) {
        return;
    }

    postsGrid.innerHTML = '';

    const statusWrapper = document.createElement('div');
    statusWrapper.className = 'posts-status';

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'posts-loading is-hidden';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <span>Đang tải bài viết...</span>
    `;

    const emptyState = document.createElement('div');
    emptyState.className = 'posts-empty is-hidden';
    emptyState.innerHTML = `
        <i class="fas fa-newspaper"></i>
        <p>Chưa có bài viết nào phù hợp bộ lọc.</p>
    `;

    statusWrapper.appendChild(loadingIndicator);
    statusWrapper.appendChild(emptyState);
    blogContainer.insertBefore(statusWrapper, postsGrid);

    const state = {
        offset: 0,
        limit: 6,
        category: null,
        search: '',
        isLoading: false,
        hasMore: true
    };

    const categoryMappings = {
        all: {
            label: 'Tất cả bài viết',
            filter: null
        },
        development: {
            label: 'Chuyển đổi số',
            filter: 'Digital Transformation'
        },
        ai: {
            label: 'AI & Automation',
            filter: 'AI & Automation'
        },
        design: {
            label: 'UI/UX Design',
            filter: 'UI/UX Design'
        },
        business: {
            label: 'An ninh hệ thống',
            filter: 'Security'
        },
        tutorials: null
    };

    const isPublishedPost = (post) =>
        (post?.status || 'draft').toLowerCase() === 'published';

    categoryButtons.forEach((button) => {
        const key = button.dataset.category;
        const mapping = categoryMappings[key];
        if (!mapping) {
            button.remove();
            return;
        }
        button.textContent = mapping.label;
        button.dataset.filter = mapping.filter || 'all';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            if (state.isLoading) return;

            categoryButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');

            state.category = mapping.filter;
            loadPosts(true);
        });
    });

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

    function slugifyCategory(category) {
        if (!category) return 'general';
        return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    function renderPost(post, index) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.dataset.category = slugifyCategory(post.category);
    article.setAttribute('data-aos', 'fade-up');
    article.setAttribute('data-aos-delay', `${(index % 6) * 100}`);
    const detailUrl = `blog-detail.html?code=${encodeURIComponent(post.code)}`;

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'post-image';
        imageWrapper.innerHTML = `
            <a href="${detailUrl}">
                <img src="${post.imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'}" alt="${post.title}">
            </a>
        `;

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'post-content';

        const metaWrapper = document.createElement('div');
        metaWrapper.className = 'post-meta';
        metaWrapper.innerHTML = `
            <span class="post-category">${post.category || 'Tin tức'}</span>
            <span class="post-date">${formatDate(post.publishedAt)}</span>
        `;

        const titleEl = document.createElement('h3');
        const titleLink = document.createElement('a');
        titleLink.href = detailUrl;
        titleLink.textContent = post.title;
        titleEl.appendChild(titleLink);

        const excerptEl = document.createElement('p');
        excerptEl.textContent = post.excerpt || (post.content ? `${post.content.slice(0, 140)}...` : '');

        const tagsWrapper = document.createElement('div');
        tagsWrapper.className = 'post-tags';
        (post.tags || []).forEach((tag) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.textContent = tag;
            tagsWrapper.appendChild(tagEl);
        });

        const readMoreLink = document.createElement('a');
        readMoreLink.className = 'read-more';
        readMoreLink.href = detailUrl;
        readMoreLink.innerHTML = 'Đọc thêm <i class="fas fa-arrow-right"></i>';

        contentWrapper.appendChild(metaWrapper);
        contentWrapper.appendChild(titleEl);
        contentWrapper.appendChild(excerptEl);
        if (post.tags && post.tags.length) {
            contentWrapper.appendChild(tagsWrapper);
        }
        contentWrapper.appendChild(readMoreLink);

        article.appendChild(imageWrapper);
        article.appendChild(contentWrapper);

        article.tabIndex = 0;
        article.dataset.href = detailUrl;
        article.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;
            window.location.href = detailUrl;
        });
        article.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' || event.target.closest('a')) return;
            window.location.href = detailUrl;
        });

        postsGrid.appendChild(article);
    }

    function toggleLoading(show) {
        loadingIndicator.classList.toggle('is-hidden', !show);
    }

    function showEmptyState(message) {
        emptyState.classList.remove('is-hidden');
        if (message) {
            emptyState.querySelector('p').textContent = message;
        }
    }

    function hideEmptyState() {
        emptyState.classList.add('is-hidden');
    }

    function updateLoadMoreVisibility() {
        if (!state.hasMore) {
            loadMoreBtn.classList.add('is-hidden');
        } else {
            loadMoreBtn.classList.remove('is-hidden');
        }
    }

    async function loadPosts(reset = false) {
        if (state.isLoading || (!state.hasMore && !reset)) {
            return;
        }

        state.isLoading = true;
        toggleLoading(true);
        hideEmptyState();

        if (reset) {
            state.offset = 0;
            state.hasMore = true;
            postsGrid.innerHTML = '';
        }

        const query = {
            limit: state.limit,
            offset: state.offset,
            status: 'published'
        };

        if (state.category) {
            query.category = state.category;
        }
        if (state.search) {
            query.search = state.search;
        }

        try {
            const posts = await window.covasolApi.fetchBlogPosts(query);
            const visiblePosts = (posts || []).filter(isPublishedPost);
            if (reset && visiblePosts.length === 0) {
                showEmptyState('Chưa có bài viết nào cho lựa chọn này.');
            } else {
                visiblePosts.forEach((post, index) => renderPost(post, state.offset + index));
                if (window.AOS) {
                    window.AOS.refresh();
                }
            }

            const batchSize = posts ? posts.length : 0;
            state.offset += batchSize;
            state.hasMore = batchSize === state.limit;
            updateLoadMoreVisibility();
        } catch (error) {
            console.error(error);
            showEmptyState(error.message || 'Không thể tải bài viết.');
            state.hasMore = false;
            updateLoadMoreVisibility();
        } finally {
            state.isLoading = false;
            toggleLoading(false);
        }
    }

    loadMoreBtn.addEventListener('click', (event) => {
        event.preventDefault();
        loadPosts();
    });

    loadPosts(true);
});






