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
    const demoOverlayEl = document.getElementById('productDemoOverlay');
    const demoGridEl = document.getElementById('productDemoGrid');
    const demoBackdropEl = document.getElementById('productDemoBackdrop');
    const demoCloseEl = document.getElementById('productDemoClose');
    const demoZoomEl = document.getElementById('productDemoZoom');
    const demoZoomImgEl = document.getElementById('productDemoZoomImg');
    const demoZoomCaptionEl = document.getElementById('productDemoZoomCaption');

    const BURST_POSITIONS = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 }
    ];

    const escapeHtml = (value = '') =>
        String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    let demoMediaCache = [];
    let activeDemoIndex = 0;

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

        const demoFallback = renderDemoFallbackSection(product);

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
            ${demoFallback}
            ${features}
            ${highlights}
        `;
    }

    const isActiveProduct = (product) =>
        (product?.status || 'inactive').toLowerCase() === 'active';

    const normalizeDemoMedia = (items = []) =>
        Array.isArray(items)
            ? items
                  .map((item, index) => ({
                      url: (item?.url || '').trim(),
                      caption: (item?.caption || '').trim(),
                      index
                  }))
                  .filter((item) => item.url)
            : [];

    function renderDemoFallbackSection(product) {
        const demoItems = normalizeDemoMedia(product?.demoMedia);
        if (!demoItems.length) {
            return '';
        }

        const stackLayers = demoItems.slice(0, 3);
        const totalLabel = demoItems.length.toString().padStart(2, '0');

        const stackHtml = stackLayers
            .map(
                (item, idx) => `
                <span class="demo-stack-layer demo-stack-layer-${idx + 1}">
                    <img src="${escapeHtml(item.url)}" alt="${escapeHtml(
                        item.caption || `Ảnh demo ${idx + 1}`
                    )}" loading="lazy" />
                </span>
            `
            )
            .join('');

        return `
            <section class="product-demo-callout" data-demo-available="true">
                <button type="button" class="demo-stack-card" data-demo-open aria-label="Xem combo ảnh demo">
                    <div class="demo-stack-layers">
                        ${stackHtml}
                    </div>
                    <div class="demo-stack-counter">
                        <strong>${totalLabel}</strong>
                        <span>ảnh demo</span>
                    </div>
                </button>
            </section>
        `;
    }

    function openDemoOverlay() {
        if (!demoOverlayEl || !demoMediaCache.length) {
            return;
        }
        demoOverlayEl.classList.add('is-visible');
        demoOverlayEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('demo-overlay-active');
        demoOverlayEl.querySelector('.demo-overlay-panel')?.focus();
        requestAnimationFrame(() => {
            demoGridEl?.classList.add('is-bursting');
        });
    }

    function closeDemoOverlay() {
        if (!demoOverlayEl) {
            return;
        }
        demoOverlayEl.classList.remove('is-visible');
        demoOverlayEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('demo-overlay-active');
        demoGridEl?.classList.remove('is-bursting');
    }

    function attachDemoTriggers() {
        const buttons = document.querySelectorAll('[data-demo-open]');
        buttons.forEach((button) => {
            if (button.dataset.demoBound === 'true') {
                return;
            }
            button.dataset.demoBound = 'true';
            button.addEventListener('click', (event) => {
                event.preventDefault();
                openDemoOverlay();
            });
        });
    }

    function setActiveDemo(index = 0) {
        if (!demoMediaCache.length || !demoGridEl) {
            return;
        }

        const total = demoMediaCache.length;
        const safeIndex = Math.min(Math.max(Number(index) || 0, 0), total - 1);
        activeDemoIndex = safeIndex;

        demoGridEl.querySelectorAll('.demo-grid-item').forEach((node, idx) => {
            const isActive = idx === safeIndex;
            node.classList.toggle('is-active', isActive);
            node.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        const media = demoMediaCache[safeIndex];
        if (demoZoomImgEl) {
            demoZoomImgEl.src = media.url;
            demoZoomImgEl.alt = media.caption || `Ảnh demo ${safeIndex + 1}`;
        }
        if (demoZoomCaptionEl) {
            demoZoomCaptionEl.textContent = media.caption || 'Ảnh demo realtime từ sản phẩm';
        }
    }

    function renderDemoOverlay(items = []) {
        if (!demoOverlayEl || !demoGridEl) {
            return;
        }

        demoMediaCache = normalizeDemoMedia(items).slice(0, BURST_POSITIONS.length);

        if (!demoMediaCache.length) {
            demoOverlayEl.setAttribute('aria-hidden', 'true');
            demoOverlayEl.classList.remove('is-visible');
            demoOverlayEl.dataset.empty = 'true';
            document.body.classList.remove('demo-overlay-active');
            if (demoZoomImgEl) {
                demoZoomImgEl.removeAttribute('src');
            }
            if (demoZoomCaptionEl) {
                demoZoomCaptionEl.textContent = 'Chưa có ảnh demo';
            }
            return;
        }

        demoOverlayEl.dataset.empty = 'false';
        const gridHtml = demoMediaCache
            .map((item, index) => {
                const slot = BURST_POSITIONS[index] || BURST_POSITIONS[0];
                return `
                    <button type="button" class="demo-grid-item" data-demo-index="${index}" style="--burst-row: ${slot.row}; --burst-col: ${slot.col};" aria-pressed="false">
                        <img src="${escapeHtml(item.url)}" alt="${escapeHtml(
                    item.caption || `Ảnh demo ${index + 1}`
                )}" loading="lazy" />
                    </button>
                `;
            })
            .join('');
        demoGridEl.innerHTML = gridHtml;
        setActiveDemo(0);
        requestAnimationFrame(() => {
            demoGridEl.classList.add('is-bursting');
        });

        attachDemoTriggers();
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
        renderDemoOverlay(product.demoMedia);

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
        if (!isActiveProduct(payload)) {
            showError('San pham nay hien dang bi an hoac tam dung hien thi.');
            return;
        }
        renderProduct(payload);
    } catch (error) {
        showError(error?.message);
    }

    demoBackdropEl?.addEventListener('click', closeDemoOverlay);
    demoCloseEl?.addEventListener('click', closeDemoOverlay);
    demoOverlayEl?.addEventListener('click', (event) => {
        if (event.target === demoOverlayEl) {
            closeDemoOverlay();
        }
    });
    demoOverlayEl?.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDemoOverlay();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDemoOverlay();
        }
    });

    demoGridEl?.addEventListener('click', (event) => {
        const target = event.target.closest ? event.target.closest('.demo-grid-item') : null;
        if (!target) {
            return;
        }
        const idx = Number.parseInt(target.dataset.demoIndex, 10);
        if (Number.isNaN(idx)) {
            return;
        }
        setActiveDemo(idx);
        
        // Popup fullscreen ngay khi click vào grid item
        setTimeout(() => {
            const img = target.querySelector('img');
            if (img && img.src) {
                const popup = createImagePopup();
                const popupImg = popup.querySelector('img');
                if (popupImg) {
                    popupImg.src = img.src;
                    popupImg.alt = img.alt;
                }
                popup.classList.add('is-active');
            }
        }, 100);
    });

    demoGridEl?.addEventListener('keydown', (event) => {
        if (!demoMediaCache.length) {
            return;
        }
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveDemo((activeDemoIndex + 1) % demoMediaCache.length);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveDemo((activeDemoIndex - 1 + demoMediaCache.length) % demoMediaCache.length);
        }
    });

    // Fullscreen popup for zoomed image
    let imagePopup = null;

    function createImagePopup() {
        if (imagePopup) return imagePopup;
        
        imagePopup = document.createElement('div');
        imagePopup.className = 'demo-image-popup';
        imagePopup.innerHTML = '<img src="" alt="Ảnh phóng to" />';
        document.body.appendChild(imagePopup);
        
        imagePopup.addEventListener('click', () => {
            imagePopup.classList.remove('is-active');
        });
        
        return imagePopup;
    }

    // Add click event to zoom image
    demoZoomEl?.addEventListener('click', (event) => {
        const img = demoZoomImgEl;
        if (!img || !img.src) return;
        
        const popup = createImagePopup();
        const popupImg = popup.querySelector('img');
        if (popupImg) {
            popupImg.src = img.src;
            popupImg.alt = img.alt;
        }
        popup.classList.add('is-active');
    });
});


