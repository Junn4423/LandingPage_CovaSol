document.addEventListener('DOMContentLoaded', async () => {
    if (!window.covasolApi) {
        console.warn('Covasol API helper is not available.');
        return;
    }

    const identifier = decodeURIComponent(window.location.pathname.split('/').pop());

    const nameEl = document.getElementById('productName');
    const summaryEl = document.getElementById('productSummary');
    const categoryEl = document.getElementById('productCategory');
    const heroImageEl = document.getElementById('productHeroImage');
    const featureTagsEl = document.getElementById('productFeatureTags');
    const descriptionEl = document.getElementById('productDescription');
    const highlightsEl = document.getElementById('productHighlights');
    const linksEl = document.getElementById('productLinks');
    const primaryCtaEl = document.getElementById('productPrimaryCta');

    function renderTags(container, values) {
        container.innerHTML = '';
        if (!values || !values.length) {
            container.style.display = 'none';
            return;
        }
        container.style.display = '';
        values.forEach((value) => {
            const tag = document.createElement('span');
            tag.className = 'feature-tag';
            tag.textContent = value;
            container.appendChild(tag);
        });
    }

    function renderDescription(container, description) {
        container.innerHTML = '';
        if (!description) {
            container.innerHTML = '<p>Nội dung sản phẩm sẽ sớm được cập nhật.</p>';
            return;
        }

        const paragraphs = description
            .split(/\n{2,}/)
            .map((part) => part.trim())
            .filter(Boolean);

        paragraphs.forEach((paragraph) => {
            if (paragraph.startsWith('##')) {
                const heading = document.createElement('h3');
                heading.textContent = paragraph.replace(/^#+\s*/, '');
                container.appendChild(heading);
            } else if (paragraph.startsWith('#')) {
                const heading = document.createElement('h2');
                heading.textContent = paragraph.replace(/^#+\s*/, '');
                container.appendChild(heading);
            } else {
                const p = document.createElement('p');
                p.textContent = paragraph;
                container.appendChild(p);
            }
        });
    }

    function renderHighlights(container, highlights) {
        container.innerHTML = '';
        if (!highlights || !highlights.length) {
            container.style.display = 'none';
            return;
        }
        container.style.display = '';

        const title = document.createElement('h3');
        title.textContent = 'Điểm nổi bật';

        const list = document.createElement('ul');
        highlights.forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check-circle"></i><span>${item}</span>`;
            list.appendChild(li);
        });

        container.appendChild(title);
        container.appendChild(list);
    }

    function renderLinks(container, product) {
        container.innerHTML = '';

        const links = [];
        if (product.ctaPrimary?.url && product.ctaPrimary.label) {
            links.push({
                label: product.ctaPrimary.label,
                url: product.ctaPrimary.url
            });
        }
        if (product.ctaSecondary?.url && product.ctaSecondary.label) {
            links.push({
                label: product.ctaSecondary.label,
                url: product.ctaSecondary.url
            });
        }

        if (!links.length) {
            container.innerHTML = '<li>Chưa có tài liệu nào được đính kèm.</li>';
            return;
        }

        links.forEach((link) => {
            const li = document.createElement('li');
            const anchor = document.createElement('a');
            anchor.href = link.url;
            anchor.target = link.url.startsWith('#') ? '_self' : '_blank';
            anchor.rel = 'noopener';
            anchor.textContent = link.label;
            li.appendChild(anchor);
            container.appendChild(li);
        });
    }

    function applyProduct(product) {
        nameEl.textContent = product.name;
        summaryEl.textContent = product.shortDescription || 'Giải pháp công nghệ linh hoạt cho doanh nghiệp.';
        categoryEl.textContent = product.category || 'Giải pháp số';
        heroImageEl.src =
            product.imageUrl ||
            'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';
        heroImageEl.alt = product.name;

        renderTags(featureTagsEl, product.featureTags);
        renderDescription(descriptionEl, product.description);
        renderHighlights(highlightsEl, product.highlights);
        renderLinks(linksEl, product);

        if (product.ctaPrimary?.label) {
            primaryCtaEl.textContent = product.ctaPrimary.label;
            if (product.ctaPrimary.url) {
                primaryCtaEl.href = product.ctaPrimary.url;
            } else {
                primaryCtaEl.href = `/products/item/${encodeURIComponent(product.code)}`;
            }
        } else {
            primaryCtaEl.style.display = 'none';
        }

        document.title = `${product.name} | COVASOL`;
    }

    try {
        const data = await window.covasolApi.fetchProduct(identifier);
        applyProduct(data);
    } catch (error) {
        console.error('Không thể tải sản phẩm:', error);
        descriptionEl.innerHTML = `
            <div class="article-error">
                <h2>Không tìm thấy sản phẩm</h2>
                <p>${error.message || 'Vui lòng quay lại để chọn sản phẩm khác.'}</p>
                <a class="btn btn-primary" href="/products.html">Quay lại danh sách</a>
            </div>
        `;
        highlightsEl.style.display = 'none';
        featureTagsEl.style.display = 'none';
        primaryCtaEl.style.display = 'none';
        document.title = 'Không tìm thấy sản phẩm | COVASOL';
    }
});
