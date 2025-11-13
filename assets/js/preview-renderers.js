(() => {
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
            ${tagsHtml}
            ${
                keywordsHtml
                    ? `<div class="preview-meta keyword-meta">
                    <span><strong>Tu khoa:</strong></span>
                    ${keywordsHtml}
                </div>`
                    : ''
            }
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
            ${featuresHtml}
            ${highlightsHtml}
        `;
    };

    window.covasolPreview = Object.freeze({
        renderBlogPreview,
        renderProductPreview
    });
})();
