document.addEventListener('DOMContentLoaded', async () => {
    const api = window.covasolApi;
    if (!api) {
        console.warn('Covasol API helper is not available.');
        return;
    }

    const previewEl = document.getElementById('productPreview');
    const linksEl = document.getElementById('productLinks');
    const primaryCtaEl = document.getElementById('productPrimaryCta');
    const previewRenderer = window.covasolPreview?.renderProductPreview;

    function resolveIdentifier() {
        const params = new URLSearchParams(window.location.search);
        const fromQuery =
            params.get('code') || params.get('id') || params.get('product');
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

    function renderFallback(product) {
        const description = product.description
            ? product.description
                  .split(/\n{2,}/)
                  .map((paragraph) => `<p>${paragraph}</p>`)
                  .join('')
            : '<p>Khong co mo ta</p>';

        const features =
            product.featureTags && product.featureTags.length
                ? `<div class="preview-tags">
                ${product.featureTags.map((tag) => `<span class="preview-tag">${tag}</span>`).join('')}
            </div>`
                : '';

        const highlights =
            product.highlights && product.highlights.length
                ? `<div class="preview-highlights">
                <h3>Diem noi bat</h3>
                <ul>
                    ${product.highlights
                        .map(
                            (item) => `<li>
                            <i class="fas fa-check-circle"></i>
                            <span>${item}</span>
                        </li>`
                        )
                        .join('')}
                </ul>
            </div>`
                : '';

        return `
            <h1>${product.name || 'Khong co ten san pham'}</h1>
            ${product.category ? `<p class="preview-category">${product.category}</p>` : ''}
            ${
                product.imageUrl
                    ? `<img src="${product.imageUrl}" alt="${product.name || 'Anh san pham'}" />`
                    : ''
            }
            ${product.shortDescription ? `<p class="preview-excerpt">${product.shortDescription}</p>` : ''}
            ${description}
            ${features}
            ${highlights}
        `;
    }

    function renderLinks(container, product) {
        if (!container) {
            return;
        }

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
            container.innerHTML = '<li>Chua co tai lieu dinh kem.</li>';
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

    function setPrimaryCta(product) {
        if (!primaryCtaEl) {
            return;
        }

        if (!product.ctaPrimary?.label) {
            primaryCtaEl.style.display = 'none';
            return;
        }

        primaryCtaEl.style.display = '';
        primaryCtaEl.textContent = product.ctaPrimary.label;
        if (product.ctaPrimary.url) {
            primaryCtaEl.href = product.ctaPrimary.url;
        } else {
            primaryCtaEl.href = `product-detail.html?code=${encodeURIComponent(product.code)}`;
        }
    }

    function renderProduct(product) {
        if (previewEl) {
            if (typeof previewRenderer === 'function') {
                previewEl.innerHTML = previewRenderer(product);
            } else {
                previewEl.innerHTML = renderFallback(product);
            }
        }

        renderLinks(linksEl, product);
        setPrimaryCta(product);

        document.title = `${product.name || 'San pham'} | COVASOL`;
    }

    function showError(message) {
        if (previewEl) {
            previewEl.innerHTML = `
                <div class="article-error preview-error">
                    <h2>Khong tim thay san pham</h2>
                    <p>${message || 'Vui long quay lai chon san pham khac.'}</p>
                    <a class="btn btn-primary" href="products.html">Quay lai danh sach</a>
                </div>
            `;
        }
        if (linksEl) {
            linksEl.innerHTML = '<li>Khong co du lieu.</li>';
        }
        if (primaryCtaEl) {
            primaryCtaEl.style.display = 'none';
        }
        document.title = 'Khong tim thay san pham | COVASOL';
    }

    try {
        const identifier = resolveIdentifier();
        if (!identifier) {
            throw new Error('Khong xac dinh duoc ma san pham.');
        }

        const payload = await api.fetchProduct(identifier);
        renderProduct(payload);
    } catch (error) {
        showError(error?.message);
    }
});
