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

    const getPositionNumber = (value) => {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    };

    const sortByPosition = (a = {}, b = {}) => {
        const posA = getPositionNumber(a.position);
        const posB = getPositionNumber(b.position);
        if (posA === null && posB === null) return 0;
        if (posA === null) return 1;
        if (posB === null) return -1;
        return posA - posB;
    };

    const splitInlineItems = (items = []) => {
        const inline = [];
        const remainder = [];
        (items || []).forEach((item) => {
            const position = getPositionNumber(item?.position);
            if (position === null) {
                remainder.push(item);
            } else {
                inline.push({ ...item, position });
            }
        });
        return { inline, remainder };
    };

    const hasHtmlMarkup = (value = '') => /<\/?[a-z][^>]*>/i.test(value);

    const splitContentIntoBlocks = (content) => {
        if (!content) return [];
        const normalized = content.replace(/\r\n/g, '\n');
        const blocks = normalized
            .split(/\n{2,}/)
            .map((block) => block.trim())
            .filter(Boolean);
        if (!blocks.length) {
            return [content];
        }
        return blocks.map((block) => {
            if (hasHtmlMarkup(block)) {
                return block;
            }
            return `<p>${block.replace(/\n/g, '<br>')}</p>`;
        });
    };

    const buildInlineImageBlock = (item = {}, labels = {}) => {
        const badge = labels[item.type] || labels.default || 'Anh';
        const caption = item.caption
            ? `<figcaption class="preview-caption"><em>${escapeHtml(item.caption)}</em></figcaption>`
            : '';
        const altText = escapeHtml(item.caption || badge);
        const safeUrl = escapeHtml(item.url);
        const inlineId = escapeHtml(item.__clientId || item.id || '');
        const inlineSource = escapeHtml(item.__inlineSource || 'media');
        return {
            position: item.position,
            html: `
                <figure class="preview-inline-block preview-inline-block--media" data-type="${
                    item.type || 'media'
                }" data-inline-id="${inlineId}" data-inline-kind="media" data-inline-source="${inlineSource}" data-inline-position="${
                    item.position ?? ''
                }">
                    <img src="${safeUrl}" alt="${altText}" loading="lazy" />
                    ${caption}
                </figure>
            `
        };
    };

    const buildInlineVideoBlock = (item = {}, labels = {}) => {
        const badge = labels[item.type] || labels.default || 'Video';
        const caption = item.caption
            ? `<p class="preview-caption"><em>${escapeHtml(item.caption)}</em></p>`
            : '';
        const inlineId = escapeHtml(item.__clientId || item.id || '');
        const inlineSource = escapeHtml(item.__inlineSource || 'video');
        return {
            position: item.position,
            html: `
                <article class="preview-inline-block preview-inline-block--video" data-type="${
                    item.type || 'video'
                }" data-inline-id="${inlineId}" data-inline-kind="video" data-inline-source="${inlineSource}" data-inline-position="${
                    item.position ?? ''
                }">
                    <div class="preview-inline-frame">
                        ${buildVideoFrame(item.url)}
                    </div>
                    ${caption}
                </article>
            `
        };
    };

    const renderBodyWithInlineEmbeds = (content, inlineEmbeds = []) => {
        const blocks = splitContentIntoBlocks(content);
        const sortedEmbeds = inlineEmbeds
            .filter((embed) => typeof embed?.html === 'string')
            .sort(sortByPosition);

        if (!blocks.length) {
            const inlineHtml = sortedEmbeds.map((embed) => embed.html).join('');
            return {
                html: `${content || 'Khong co noi dung'}${inlineHtml}`,
                paragraphCount: 0
            };
        }

        let embedIndex = 0;
        let paragraphIndex = 0;
        const output = [];

        const appendEmbedsUpTo = (positionLimit) => {
            while (
                embedIndex < sortedEmbeds.length &&
                (sortedEmbeds[embedIndex].position ?? Number.MAX_SAFE_INTEGER) <= positionLimit
            ) {
                output.push(sortedEmbeds[embedIndex].html);
                embedIndex += 1;
            }
        };

        appendEmbedsUpTo(0);
        blocks.forEach((block) => {
            output.push(`<div class="preview-paragraph" data-paragraph-index="${paragraphIndex + 1}">${block}</div>`);
            paragraphIndex += 1;
            appendEmbedsUpTo(paragraphIndex);
        });
        appendEmbedsUpTo(Number.MAX_SAFE_INTEGER);

        return {
            html: output.join(''),
            paragraphCount: blocks.length
        };
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
        const cards = (items || [])
            .slice()
            .sort(sortByPosition)
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

        const videos = (items || [])
            .slice()
            .sort(sortByPosition)
            .filter((item) => item?.url)
            .map((item) => {
                const badge = labels[item.type] || labels.default || 'Video';
                const caption = item.caption
                    ? `<p class="preview-caption"><em>${escapeHtml(item.caption)}</em></p>`
                    : '';
                return `
                    <article class="preview-video-item" data-type="${item.type || 'video'}">
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
                        ${escapeHtml(item.label || 'Nguồn tham khảo')}
                    </a>
                </li>
            `
            )
            .join('');
        if (!items) return '';
        return `
            <section class="preview-sources">
                <h4>Nguồn tham khảo</h4>
                <ul>
                    ${items}
                </ul>
            </section>
        `;
    };

    const renderBlogPreview = (data = {}) => {
        const safeTitle = escapeHtml(data.title || 'Khong co tieu de');
        const subtitleHtml = data.subtitle
            ? `<p class="preview-subtitle">${escapeHtml(data.subtitle)}</p>`
            : '';

        const metaItems = [];
        if (data.category) {
            metaItems.push(`<span class="meta-badge">${escapeHtml(data.category)}</span>`);
        }

        const formattedDate = data.publishedAt ? formatDate(data.publishedAt) : '';
        if (formattedDate && formattedDate !== 'Chua xac dinh') {
            metaItems.push(
                `<span class="meta-date">${escapeHtml(formattedDate)}</span>`
            );
        }

        if (data.authorName) {
            const authorRole = data.authorRole ? ` - ${escapeHtml(data.authorRole)}` : '';
            metaItems.push(
                `<span class="meta-author">B&#7903;i ${escapeHtml(data.authorName)}${authorRole}</span>`
            );
        }

        const metaHtml = metaItems.length
            ? `<div class="preview-meta">${metaItems.join('')}</div>`
            : '';

        const heroImageHtml = data.imageUrl
            ? `<div class="preview-hero-image"><img src="${escapeHtml(
                  data.imageUrl
              )}" alt="${safeTitle}" loading="lazy" /></div>`
            : '';

        const excerptHtml = data.excerpt
            ? `<p class="preview-excerpt">${escapeHtml(data.excerpt)}</p>`
            : '';

        const tagsHtml =
            data.tags && data.tags.length > 0
                ? `<div class="preview-tags">
                ${data.tags.map((tag) => `<span class="preview-tag">${escapeHtml(tag)}</span>`).join('')}
               </div>`
                : '';

        const keywordTags =
            data.keywords && data.keywords.length > 0
                ? data.keywords
                      .map((keyword) => `<span class="preview-tag is-muted">${escapeHtml(keyword)}</span>`)
                      .join('')
                : '';

        const keywordsHtml = keywordTags
            ? `<div class="preview-meta keyword-meta">
                    <span><strong>Tu khoa:</strong></span>
                    <div class="preview-tags keyword-tags">${keywordTags}</div>
               </div>`
            : '';

        const bodyContent = data.content || 'Khong co noi dung';

        const { inline: inlineMedia, remainder: galleryMedia } = splitInlineItems(
            data.galleryMedia
        );
        const { inline: inlineVideos, remainder: videoItems } = splitInlineItems(data.videoItems);

        const inlineBlocks = [
            ...inlineMedia.map((item) => buildInlineImageBlock(item, BLOG_MEDIA_LABELS)),
            ...inlineVideos.map((item) => buildInlineVideoBlock(item, BLOG_VIDEO_LABELS))
        ];

        const inlineBody = renderBodyWithInlineEmbeds(bodyContent, inlineBlocks);

        const galleryHtml = renderMediaSection(galleryMedia, {
            title: 'Thu vien anh',
            labels: { ...BLOG_MEDIA_LABELS, default: 'Anh' }
        });

        const videoHtml = renderVideoSection(videoItems, {
            title: 'Video minh hoa',
            labels: { ...BLOG_VIDEO_LABELS, default: 'Video' }
        });

        const sourcesHtml = renderSourceList(data.sourceLinks);

        const footerSections = [tagsHtml, keywordsHtml, sourcesHtml]
            .filter(Boolean)
            .join('');

        const footerHtml = footerSections
            ? `<div class="preview-footer-panel">${footerSections}</div>`
            : '';

        return `
            <div class="live-preview-header">
                <h1>${safeTitle}</h1>
                ${subtitleHtml}
                ${metaHtml}
            </div>
            ${heroImageHtml}
            ${excerptHtml}
            <div class="preview-body live-preview-body" data-paragraph-count="${inlineBody.paragraphCount}">${inlineBody.html}</div>
            ${galleryHtml}
            ${videoHtml}
            ${footerHtml}
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

        const { inline: inlineMedia, remainder: galleryMedia } = splitInlineItems(
            data.galleryMedia
        );
        const { inline: inlineVideos, remainder: videoItems } = splitInlineItems(data.videoItems);

        const inlineBlocks = [
            ...inlineMedia.map((item) => buildInlineImageBlock(item, PRODUCT_MEDIA_LABELS)),
            ...inlineVideos.map((item) => buildInlineVideoBlock(item, PRODUCT_VIDEO_LABELS))
        ];

        const inlineBody = renderBodyWithInlineEmbeds(descriptionContent, inlineBlocks);

        const galleryHtml = renderMediaSection(galleryMedia, {
            title: 'Thu vien anh san pham',
            labels: { ...PRODUCT_MEDIA_LABELS, default: 'Anh' }
        });

        const videoHtml = renderVideoSection(videoItems, {
            title: 'Video demo',
            labels: { ...PRODUCT_VIDEO_LABELS, default: 'Video' }
        });

        const footerSections = [featuresHtml, highlightsHtml]
            .filter(Boolean)
            .join('');

        const footerHtml = footerSections
            ? `<div class="preview-footer-panel">${footerSections}</div>`
            : '';

        return `
            <h1>${data.name || 'Khong co ten san pham'}</h1>
            ${data.category ? `<p class="preview-category">${data.category}</p>` : ''}
            ${
                data.imageUrl
                    ? `<img src="${data.imageUrl}" alt="${data.name || 'Anh san pham'}" />`
                    : ''
            }
            ${data.shortDescription ? `<p class="preview-excerpt">${data.shortDescription}</p>` : ''}
            <div class="preview-body" data-paragraph-count="${inlineBody.paragraphCount}">${inlineBody.html}</div>
            ${galleryHtml}
            ${videoHtml}
            ${footerHtml}
        `;
    };

    window.covasolPreview = Object.freeze({
        renderBlogPreview,
        renderProductPreview
    });
})();
