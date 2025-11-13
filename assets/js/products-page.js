document.addEventListener('DOMContentLoaded', async () => {
    if (!window.covasolApi) {
        console.warn('Covasol API helper is not available.');
        return;
    }

    const grid = document.querySelector('.products-grid');
    const container = document.querySelector('.products-grid')?.parentElement;

    if (!grid || !container) {
        return;
    }

    grid.innerHTML = '';

    const statusWrapper = document.createElement('div');
    statusWrapper.className = 'posts-status';

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'posts-loading';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <span>Đang tải sản phẩm...</span>
    `;

    const emptyState = document.createElement('div');
    emptyState.className = 'posts-empty is-hidden';
    emptyState.innerHTML = `
        <i class="fas fa-box-open"></i>
        <p>Chưa có sản phẩm nào được công bố.</p>
    `;

    statusWrapper.appendChild(loadingIndicator);
    statusWrapper.appendChild(emptyState);
    container.insertBefore(statusWrapper, grid);

    const isActiveProduct = (product) =>
        (product?.status || 'inactive').toLowerCase() === 'active';

    function renderFeatureTags(features) {
        const wrapper = document.createElement('div');
        wrapper.className = 'product-features';
        (features || []).forEach((feature) => {
            const tag = document.createElement('span');
            tag.className = 'feature-tag';
            tag.textContent = feature;
            wrapper.appendChild(tag);
        });
        return wrapper;
    }

    function renderProduct(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-aos', 'zoom-in');
    card.setAttribute('data-aos-delay', `${(index % 6) * 100}`);

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'product-image';
    const detailUrl = `product-detail.html?code=${encodeURIComponent(product.code)}`;
        imageWrapper.innerHTML = `
            <a href="${detailUrl}">
                <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'}" alt="${product.name}">
            </a>
        `;

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'product-content';

        const title = document.createElement('h3');
        const titleLink = document.createElement('a');
        titleLink.href = detailUrl;
        titleLink.textContent = product.name;
        title.appendChild(titleLink);

        const category = document.createElement('p');
        category.className = 'product-category';
        category.textContent = product.category || 'Giải pháp số';

        const description = document.createElement('p');
        description.className = 'product-description';
        description.textContent =
            product.shortDescription || (product.description ? `${product.description.slice(0, 160)}...` : '');

        const featureTags = renderFeatureTags(product.featureTags);

        const actions = document.createElement('div');
        actions.className = 'product-actions';

        if (product.ctaPrimary?.label) {
            const primary = document.createElement('a');
            primary.className = 'btn btn-primary';
            primary.textContent = product.ctaPrimary.label;
            primary.href = product.ctaPrimary.url || detailUrl;
            actions.appendChild(primary);
        }

    const learnMore = document.createElement('a');
    learnMore.className = 'btn btn-outline';
    learnMore.href = detailUrl;
    learnMore.textContent = product.ctaSecondary?.label || 'Tìm hiểu chi tiết';
        actions.appendChild(learnMore);

        contentWrapper.appendChild(title);
        contentWrapper.appendChild(category);
        contentWrapper.appendChild(description);
        if (product.featureTags && product.featureTags.length) {
            contentWrapper.appendChild(featureTags);
        }
        contentWrapper.appendChild(actions);

        card.appendChild(imageWrapper);
        card.appendChild(contentWrapper);

        card.tabIndex = 0;
        card.dataset.href = detailUrl;
        card.addEventListener('click', (event) => {
            if (event.target.closest('a')) return;
            window.location.href = detailUrl;
        });
        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' || event.target.closest('a')) return;
            window.location.href = detailUrl;
        });

        grid.appendChild(card);
    }

    try {
        const products = await window.covasolApi.fetchProducts({
            limit: 24,
            offset: 0,
            status: 'active'
        });

        const visibleProducts = (products || []).filter(isActiveProduct);
        if (!visibleProducts.length) {
            emptyState.classList.remove('is-hidden');
            return;
        }

        visibleProducts.forEach((product, index) => renderProduct(product, index));
        if (window.AOS) {
            window.AOS.refresh();
        }
    } catch (error) {
        console.error('Không thể tải sản phẩm:', error);
        emptyState.classList.remove('is-hidden');
        emptyState.querySelector('p').textContent = error.message || 'Không thể tải danh sách sản phẩm.';
    } finally {
        loadingIndicator.classList.add('is-hidden');
    }
});



