(() => {
    const escapeHtml = (value = '') =>
        String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const formatDate = (value) => {
        if (!value) {
            return 'Chua xac dinh';
        }
        try {
            return new Date(value).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Unable to format date for preview:', error);
            return 'Chua xac dinh';
        }
    };

    const BLOG_MEDIA_LABELS = {
        cover: 'Anh bia',
        body: 'Anh noi dung',
        inline: 'Anh chen',
        quote: 'Anh trich dan',
        gallery: 'Anh gallery'
    };

    const BLOG_VIDEO_LABELS = {
        hero: 'Video mo dau',
        body: 'Video noi dung',
        demo: 'Video demo',
        interview: 'Video phong van'
    };

    const PRODUCT_MEDIA_LABELS = {
        hero: 'Anh hero',
        gallery: 'Anh gallery',
        body: 'Anh noi dung',
        detail: 'Anh tinh nang'
    };

    const PRODUCT_VIDEO_LABELS = {
        hero: 'Video hero',
        demo: 'Video demo',
        body: 'Video noi dung',
        testimonial: 'Video khach hang'
    };

    const toEmbedUrl = (url) => {
        if (!url) return '';
        const ytMatch = url.match(/(?:watch\?v=|youtu\.be\/)([\w-]+)/i);
        if (ytMatch) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
        return url;
    };

    const buildVideoFrame = (url) => {
        if (!url) return '';
        const normalized = toEmbedUrl(url);
        if (/\.(mp4|webm|ogg)$/i.test(normalized)) {
            return `<video controls src="${escapeHtml(normalized)}" preload="metadata"></video>`;
        }
        if (/^https?:\/\//i.test(normalized)) {
            return `<iframe src="${escapeHtml(
                normalized
            )}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        }
        return `<a class="preview-video-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Xem video</a>`;
    };

    const renderMediaSection = (items = [], { title, labels }) => {
        if (!items || !items.length) {
            return '';
        }
        const cards = items
            .filter((item) => item?.url)
            .map((item) => {
                const badge = labels[item.type] || labels.default || 'Anh';
                const caption = item.caption
                    ? `<figcaption class="preview-caption"><em>${escapeHtml(item.caption)}</em></figcaption>`
                    : '';
                const safeUrl = escapeHtml(item.url);
                const altText = escapeHtml(item.caption || badge);
                return `
                    <figure class="preview-media-card" data-type="${item.type || 'media'}">
                        <span class="preview-media-badge">${badge}</span>
                        <img src="${safeUrl}" alt="${altText}" loading="lazy" />
                        ${caption}
                    </figure>
                `;
            })
            .join('');
        if (!cards) return '';
        return `
            <section class="preview-media-section">
                <h3>${title}</h3>
                <div class="preview-media-grid">
                    ${cards}
                </div>
            </section>
        `;
    };

    const renderVideoSection = (items = [], { title, labels }) => {
        if (!items || !items.length) {
            return '';
        }

        const videos = items
            .filter((item) => item?.url)
            .map((item) => {
                const badge = labels[item.type] || labels.default || 'Video';
                const caption = item.caption
                    ? `<p class="preview-caption"><em>${escapeHtml(item.caption)}</em></p>`
                    : '';
                return `
                    <article class="preview-video-item" data-type="${item.type || 'video'}">
                        <span class="preview-media-badge">${badge}</span>
                        <div class="preview-video-frame">
                            ${buildVideoFrame(item.url)}
                        </div>
                        ${caption}
                    </article>
                `;
            })
            .join('');

        if (!videos) return '';

        return `
            <section class="preview-video-section">
                <h3>${title}</h3>
                <div class="preview-video-list">
                    ${videos}
                </div>
            </section>
        `;
    };

    const renderSourceList = (sources = []) => {
        if (!sources || !sources.length) {
            return '';
        }
        const items = sources
            .filter((item) => item?.url)
            .map(
                (item) => `
                <li>
                    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
                        ${escapeHtml(item.label || 'Nguon tham khao')}
                    </a>
                </li>
            `
            )
            .join('');
        if (!items) return '';
        return `
            <section class="preview-sources">
                <h4>Nguon tham khao</h4>
                <ul>
                    ${items}
                </ul>
            </section>
        `;
    };

    const renderBlogPreview = (data = {}) => {
        const tagsHtml =
            data.tags && data.tags.length > 0
                ? `<div class="preview-tags">
                ${data.tags.map((tag) => `<span class="preview-tag">${tag}</span>`).join('')}
               </div>`
                : '';

        const keywordsHtml =
            data.keywords && data.keywords.length > 0
                ? `<div class="preview-tags keyword-tags">
                ${data.keywords.map((keyword) => `<span class="preview-tag is-muted">${keyword}</span>`).join('')}
               </div>`
                : '';

        const bodyContent = data.content || 'Khong co noi dung';

        const galleryHtml = renderMediaSection(data.galleryMedia, {
            title: 'Thu vien anh',
            labels: { ...BLOG_MEDIA_LABELS, default: 'Anh' }
        });

        const videoHtml = renderVideoSection(data.videoItems, {
            title: 'Video minh hoa',
            labels: { ...BLOG_VIDEO_LABELS, default: 'Video' }
        });

        const sourcesHtml = renderSourceList(data.sourceLinks);

        return `
            <h1>${data.title || 'Khong co tieu de'}</h1>
            ${data.subtitle ? `<p class="preview-subtitle">${data.subtitle}</p>` : ''}
            <div class="preview-meta">
                ${
                    data.category
                        ? `<span><strong>Danh muc:</strong> ${data.category}</span>`
                        : ''
                }
                <span><strong>Ngay:</strong> ${formatDate(data.publishedAt)}</span>
                ${
                    data.authorName
                        ? `<span><strong>Tac gia:</strong> ${data.authorName}${
                              data.authorRole ? ' - ' + data.authorRole : ''
                          }</span>`
                        : ''
                }
            </div>
            ${
                data.imageUrl
                    ? `<img src="${data.imageUrl}" alt="${data.title || 'Anh bai viet'}" />`
                    : ''
            }
            ${data.excerpt ? `<p class="preview-excerpt">${data.excerpt}</p>` : ''}
            <div class="preview-body">${bodyContent}</div>
            ${galleryHtml}
            ${videoHtml}
            ${tagsHtml}
            ${
                keywordsHtml
                    ? `<div class="preview-meta keyword-meta">
                    <span><strong>Tu khoa:</strong></span>
                    ${keywordsHtml}
                </div>`
                    : ''
            }
            ${sourcesHtml}
        `;
    };

    const renderProductPreview = (data = {}) => {
        const featuresHtml =
            data.featureTags && data.featureTags.length > 0
                ? `<div class="preview-tags" style="margin-top: 1.5rem;">
                ${data.featureTags.map((tag) => `<span class="preview-tag">${tag}</span>`).join('')}
               </div>`
                : '';

        const highlightsHtml =
            data.highlights && data.highlights.length > 0
                ? `<div class="preview-highlights">
                <h3>Diem noi bat</h3>
                <ul>
                    ${data.highlights
                        .map(
                            (highlight) => `<li>
                        <i class="fas fa-check-circle"></i>
                        <span>${highlight}</span>
                    </li>`
                        )
                        .join('')}
                </ul>
               </div>`
                : '';

        const descriptionContent = data.description || 'Khong co mo ta';

        const galleryHtml = renderMediaSection(data.galleryMedia, {
            title: 'Thu vien anh san pham',
            labels: { ...PRODUCT_MEDIA_LABELS, default: 'Anh' }
        });

        const videoHtml = renderVideoSection(data.videoItems, {
            title: 'Video demo',
            labels: { ...PRODUCT_VIDEO_LABELS, default: 'Video' }
        });

        return `
            <h1>${data.name || 'Khong co ten san pham'}</h1>
            ${data.category ? `<p class="preview-category">${data.category}</p>` : ''}
            ${
                data.imageUrl
                    ? `<img src="${data.imageUrl}" alt="${data.name || 'Anh san pham'}" />`
                    : ''
            }
            ${data.shortDescription ? `<p class="preview-excerpt">${data.shortDescription}</p>` : ''}
            <div class="preview-body">${descriptionContent}</div>
            ${galleryHtml}
            ${videoHtml}
            ${featuresHtml}
            ${highlightsHtml}
        `;
    };

    window.covasolPreview = Object.freeze({
        renderBlogPreview,
        renderProductPreview
    });
})();
