import type { BlogPostDetail, ProductDetail } from '@/types/content';
import { normalizeImageUrl } from '@/lib/image-url';

type InlineItem = {
  url?: string | null;
  caption?: string | null;
  title?: string | null;
  type?: string | null;
  position?: number | string | null;
  __clientId?: string | null;
  __inlineSource?: string | null;
};

type InlineBlock = {
  position: number | null;
  html: string;
};

type SplitInlineResult = {
  inline: InlineItem[];
  remainder: InlineItem[];
};

const BLOG_MEDIA_LABELS: Record<string, string> = {
  cover: 'Ảnh bìa',
  body: 'Ảnh nội dung',
  inline: 'Ảnh chèn',
  quote: 'Ảnh trích dẫn',
  gallery: 'Ảnh gallery',
  default: 'Ảnh'
};

const BLOG_VIDEO_LABELS: Record<string, string> = {
  hero: 'Video mở đầu',
  body: 'Video nội dung',
  demo: 'Video demo',
  interview: 'Video phỏng vấn',
  default: 'Video'
};

const PRODUCT_MEDIA_LABELS: Record<string, string> = {
  hero: 'Ảnh tiêu đề',
  inline: 'Ảnh chèn',
  gallery: 'Ảnh thư viện',
  default: 'Ảnh'
};

const PRODUCT_VIDEO_LABELS: Record<string, string> = {
  hero: 'Video mở đầu',
  body: 'Video nội dung',
  demo: 'Video demo',
  default: 'Video'
};

function escapeHtml(value: unknown = ''): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value?: string | null) {
  if (!value) return 'Chưa xác định';
  try {
    return new Date(value).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Unable to format date for preview:', error);
    return 'Chưa xác định';
  }
}

function sanitizeImageUrl(value?: string | null, fallback?: string) {
  return escapeHtml(normalizeImageUrl(value, { fallback: fallback ?? '' }));
}

function getPositionNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function splitInlineItems(items: unknown): SplitInlineResult {
  if (!Array.isArray(items)) {
    return { inline: [], remainder: [] };
  }

  const inline: InlineItem[] = [];
  const remainder: InlineItem[] = [];

  items.forEach(rawItem => {
    if (!rawItem || typeof rawItem !== 'object') {
      return;
    }
    const item = rawItem as InlineItem;
    const position = getPositionNumber(item.position ?? null);
    if (position === null) {
      remainder.push(item);
    } else {
      inline.push({ ...item, position });
    }
  });

  return { inline, remainder };
}

function sortByPosition(a: InlineBlock, b: InlineBlock) {
  const posA = a.position ?? Number.MAX_SAFE_INTEGER;
  const posB = b.position ?? Number.MAX_SAFE_INTEGER;
  if (posA === posB) return 0;
  return posA - posB;
}

const HTML_MARKUP_REGEX = /<\/?[a-z][^>]*>/i;

function hasHtmlMarkup(value: string) {
  return HTML_MARKUP_REGEX.test(value);
}

function splitContentIntoBlocks(content: string) {
  if (!content) return [] as string[];
  const normalized = content.replace(/\r\n/g, '\n');
  const blocks = normalized
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean);
  if (!blocks.length) {
    return [content];
  }
  return blocks.map(block => {
    if (hasHtmlMarkup(block)) {
      return block;
    }
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  });
}

function buildVideoFrame(url?: string | null) {
  if (!url) return '';
  const normalized = toEmbedUrl(url);
  if (/\.(mp4|webm|ogg)$/i.test(normalized)) {
    return `<video controls src="${escapeHtml(normalized)}" preload="metadata"></video>`;
  }
  if (/^https?:\/\//i.test(normalized)) {
    return `<iframe src="${escapeHtml(normalized)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  }
  return `<a class="preview-video-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Xem video</a>`;
}

function toEmbedUrl(url: string) {
  const ytMatch = url.match(/(?:watch\?v=|youtu\.be\/)([\w-]+)/i);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
}

function buildInlineImageBlock(item: InlineItem, labels: Record<string, string>, showPositionControls = false): InlineBlock {
  const badge = labels[item.type ?? ''] || labels.default || 'Ảnh';
  const caption = item.caption ? `<figcaption class="preview-caption"><em>${escapeHtml(item.caption)}</em></figcaption>` : '';
  const altText = escapeHtml(item.caption || badge);
  const safeUrl = sanitizeImageUrl(item.url);
  const inlineId = escapeHtml(item.__clientId || item.__inlineSource || item.url || '');
  const inlineSource = escapeHtml(item.__inlineSource || 'media');
  const positionControls = showPositionControls ? `
    <div class="preview-position-controls" style="position: absolute; top: 4px; right: 4px; display: flex; gap: 2px; z-index: 10;">
      <button type="button" class="preview-position-btn preview-position-up" data-action="move-up" data-inline-id="${inlineId}" data-inline-kind="media" title="Di chuyển lên" style="width: 24px; height: 24px; border-radius: 4px; border: none; background: rgba(255,255,255,0.9); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
        <i class="fas fa-chevron-up" style="font-size: 10px; color: #374151;"></i>
      </button>
      <button type="button" class="preview-position-btn preview-position-down" data-action="move-down" data-inline-id="${inlineId}" data-inline-kind="media" title="Di chuyển xuống" style="width: 24px; height: 24px; border-radius: 4px; border: none; background: rgba(255,255,255,0.9); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
        <i class="fas fa-chevron-down" style="font-size: 10px; color: #374151;"></i>
      </button>
    </div>` : '';
  return {
    position: getPositionNumber(item.position ?? null),
    html: `
      <figure class="preview-inline-block preview-inline-block--media" data-type="${item.type || 'media'}" data-inline-id="${inlineId}" data-inline-kind="media" data-inline-source="${inlineSource}" data-inline-position="${item.position ?? ''}" style="position: relative;">
        ${positionControls}
        <img src="${safeUrl}" alt="${altText}" loading="lazy" />
        ${caption}
      </figure>
    `.trim()
  };
}

function buildInlineVideoBlock(item: InlineItem, labels: Record<string, string>, showPositionControls = false): InlineBlock {
  const caption = item.caption ? `<p class="preview-caption"><em>${escapeHtml(item.caption)}</em></p>` : '';
  const inlineId = escapeHtml(item.__clientId || item.__inlineSource || item.url || '');
  const inlineSource = escapeHtml(item.__inlineSource || 'video');
  const positionControls = showPositionControls ? `
    <div class="preview-position-controls" style="position: absolute; top: 4px; right: 4px; display: flex; gap: 2px; z-index: 10;">
      <button type="button" class="preview-position-btn preview-position-up" data-action="move-up" data-inline-id="${inlineId}" data-inline-kind="video" title="Di chuyển lên" style="width: 24px; height: 24px; border-radius: 4px; border: none; background: rgba(255,255,255,0.9); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
        <i class="fas fa-chevron-up" style="font-size: 10px; color: #374151;"></i>
      </button>
      <button type="button" class="preview-position-btn preview-position-down" data-action="move-down" data-inline-id="${inlineId}" data-inline-kind="video" title="Di chuyển xuống" style="width: 24px; height: 24px; border-radius: 4px; border: none; background: rgba(255,255,255,0.9); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
        <i class="fas fa-chevron-down" style="font-size: 10px; color: #374151;"></i>
      </button>
    </div>` : '';
  return {
    position: getPositionNumber(item.position ?? null),
    html: `
      <article class="preview-inline-block preview-inline-block--video" data-type="${item.type || 'video'}" data-inline-id="${inlineId}" data-inline-kind="video" data-inline-source="${inlineSource}" data-inline-position="${item.position ?? ''}" style="position: relative;">
        ${positionControls}
        <div class="preview-inline-frame">
          ${buildVideoFrame(item.url || '')}
        </div>
        ${caption}
      </article>
    `.trim()
  };
}

function renderBodyWithInlineEmbeds(content: string, inlineEmbeds: InlineBlock[]) {
  const blocks = splitContentIntoBlocks(content);
  const sortedEmbeds = inlineEmbeds.filter(embed => typeof embed.html === 'string').sort(sortByPosition);

  if (!blocks.length) {
    const inlineHtml = sortedEmbeds.map(embed => embed.html).join('');
    return {
      html: `${content || 'Không có nội dung'}${inlineHtml}`,
      paragraphCount: 0
    };
  }

  let embedIndex = 0;
  let paragraphIndex = 0;
  const output: string[] = [];

  const appendEmbedsUpTo = (positionLimit: number) => {
    while (
      embedIndex < sortedEmbeds.length &&
      (sortedEmbeds[embedIndex].position ?? Number.MAX_SAFE_INTEGER) <= positionLimit
    ) {
      output.push(sortedEmbeds[embedIndex].html);
      embedIndex += 1;
    }
  };

  appendEmbedsUpTo(0);
  blocks.forEach(block => {
    output.push(`<div class="preview-paragraph" data-paragraph-index="${paragraphIndex + 1}">${block}</div>`);
    paragraphIndex += 1;
    appendEmbedsUpTo(paragraphIndex);
  });
  appendEmbedsUpTo(Number.MAX_SAFE_INTEGER);

  return {
    html: output.join(''),
    paragraphCount: blocks.length
  };
}

function renderMediaSection(items: InlineItem[], title: string, labels: Record<string, string>) {
  if (!items || !items.length) {
    return '';
  }

  const cards = items
    .slice()
    .filter(item => item?.url)
    .map(item => {
      const badge = labels[item.type ?? ''] || labels.default || 'Ảnh';
      const caption = item.caption ? `<figcaption class="preview-caption"><em>${escapeHtml(item.caption)}</em></figcaption>` : '';
      const safeUrl = sanitizeImageUrl(item.url);
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
}

function renderVideoSection(items: InlineItem[], title: string, labels: Record<string, string>) {
  if (!items || !items.length) {
    return '';
  }

  const videos = items
    .slice()
    .filter(item => item?.url)
    .map(item => {
      const caption = item.caption ? `<p class="preview-caption"><em>${escapeHtml(item.caption)}</em></p>` : '';
      return `
        <article class="preview-video-item" data-type="${item.type || 'video'}">
          <div class="preview-video-frame">
            ${buildVideoFrame(item.url || '')}
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
}

function renderSourceList(sources: unknown) {
  if (!Array.isArray(sources)) {
    return '';
  }

  const items = sources
    .filter(item => item && typeof item === 'object' && 'url' in (item as Record<string, unknown>))
    .map((item: any) => `
      <li>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
          ${escapeHtml(item.label || item.url || 'Nguồn tham khảo')}
        </a>
      </li>
    `)
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
}

export interface PreviewOptions {
  showPositionControls?: boolean;
}

export function renderBlogPreviewHtml(data: BlogPostDetail, options: PreviewOptions = {}) {
  const { showPositionControls = false } = options;
  const safeData = data ?? ({} as BlogPostDetail);
  const safeTitle = escapeHtml(safeData.title || 'Không có tiêu đề');
  const subtitleHtml = safeData.subtitle ? `<p class="preview-subtitle">${escapeHtml(safeData.subtitle)}</p>` : '';

  const metaItems: string[] = [];
  if (safeData.category) {
    metaItems.push(`<span class="meta-badge">${escapeHtml(safeData.category)}</span>`);
  }

  const formattedDate = safeData.publishedAt ? formatDate(safeData.publishedAt) : '';
  if (formattedDate && formattedDate !== 'Chưa xác định') {
    metaItems.push(`<span class="meta-date">${escapeHtml(formattedDate)}</span>`);
  }

  if (safeData.author) {
    const authorRole = safeData.authorRole ? ` · ${escapeHtml(safeData.authorRole)}` : '';
    const authorAvatar = safeData.authorAvatar 
      ? `<img src="${sanitizeImageUrl(safeData.authorAvatar)}" alt="${escapeHtml(safeData.author)}" class="meta-author-avatar" />`
      : '';
    metaItems.push(`<span class="meta-author">${authorAvatar}${escapeHtml(safeData.author)}${authorRole}</span>`);
  }

  const metaHtml = metaItems.length ? `<div class="preview-meta">${metaItems.join('')}</div>` : '';
  const heroImageUrl = safeData.heroImage || (safeData as any).imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80';
  const heroImageHtml = heroImageUrl
    ? `<div class="preview-hero-image"><img src="${sanitizeImageUrl(heroImageUrl)}" alt="${safeTitle}" loading="lazy" /></div>`
    : '';

  const excerptHtml = safeData.excerpt ? `<p class="preview-excerpt">${escapeHtml(safeData.excerpt)}</p>` : '';

  const { inline: inlineMedia, remainder: galleryMedia } = splitInlineItems(safeData.galleryMedia);
  const { inline: inlineVideos, remainder: videoItems } = splitInlineItems(safeData.videoItems);

  const inlineBlocks: InlineBlock[] = [
    ...inlineMedia.map(item => buildInlineImageBlock(item, BLOG_MEDIA_LABELS, showPositionControls)),
    ...inlineVideos.map(item => buildInlineVideoBlock(item, BLOG_VIDEO_LABELS, showPositionControls))
  ];

  const inlineBody = renderBodyWithInlineEmbeds(safeData.content || 'Không có nội dung', inlineBlocks);

  const tagsHtml = safeData.tags?.length
    ? `<div class="preview-tags">${safeData.tags.map(tag => `<span class="preview-tag">${escapeHtml(tag)}</span>`).join('')}</div>`
    : '';

  const keywordsHtml = safeData.keywords?.length
    ? `<div class="preview-meta keyword-meta">
        <span><strong>Từ khoá:</strong></span>
        <div class="preview-tags keyword-tags">
          ${safeData.keywords.map(keyword => `<span class="preview-tag is-muted">${escapeHtml(keyword)}</span>`).join('')}
        </div>
      </div>`
    : '';

  const galleryHtml = renderMediaSection(galleryMedia, 'Thư viện hình ảnh', BLOG_MEDIA_LABELS);
  const videoHtml = renderVideoSection(videoItems, 'Video minh hoạ', BLOG_VIDEO_LABELS);
  const sourcesHtml = renderSourceList(safeData.sourceLinks);

  const footerSections = [tagsHtml, keywordsHtml, sourcesHtml].filter(Boolean).join('');
  const footerHtml = footerSections ? `<div class="preview-footer-panel">${footerSections}</div>` : '';

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
}

type DemoMediaItem = { url: string; caption?: string | null };

function sanitizeDemoMedia(items?: DemoMediaItem[]) {
  if (!Array.isArray(items)) {
    return [] as DemoMediaItem[];
  }
  return items
    .map(item => ({
      url: item?.url?.trim() ?? '',
      caption: item?.caption?.trim() ?? ''
    }))
    .filter(item => Boolean(item.url));
}

function renderDemoComboSection(items?: DemoMediaItem[]) {
  const sanitized = sanitizeDemoMedia(items);
  if (!sanitized.length) {
    return '';
  }

  const layers = sanitized.slice(0, 3)
    .map((item, index) => `
      <span class="demo-stack-layer demo-stack-layer-${index + 1}">
        <img src="${sanitizeImageUrl(item.url)}" alt="${escapeHtml(item.caption || `Ảnh demo ${index + 1}`)}" loading="lazy" />
      </span>
    `)
    .join('');

  const totalLabel = String(sanitized.length).padStart(2, '0');

  return `
    <section class="product-demo-callout" data-demo-available="true">
      <button type="button" class="demo-stack-card" data-demo-open aria-label="Xem combo ảnh demo">
        <div class="demo-stack-layers">
          ${layers}
        </div>
        <div class="demo-stack-counter">
          <strong>${totalLabel}</strong>
          <span>ảnh demo</span>
        </div>
      </button>
    </section>
  `;
}

export function renderProductPreviewHtml(data: ProductDetail, options: PreviewOptions = {}) {
  const { showPositionControls = false } = options;
  const safeData = data ?? ({} as ProductDetail);
  const title = escapeHtml(safeData.name || 'Sản phẩm chưa đặt tên');
  const category = safeData.category ? `<div class="meta-badge">${escapeHtml(safeData.category)}</div>` : '';
  const heroImage = safeData.imageUrl
    ? `<div class="preview-hero-image"><img src="${sanitizeImageUrl(safeData.imageUrl)}" alt="${title}" loading="lazy" /></div>`
    : '';

  const { inline: inlineMedia, remainder: galleryMedia } = splitInlineItems(safeData.galleryMedia);
  const { inline: inlineVideos, remainder: videoItems } = splitInlineItems(safeData.videoItems);

  const inlineBlocks: InlineBlock[] = [
    ...inlineMedia.map(item => buildInlineImageBlock(item, PRODUCT_MEDIA_LABELS, showPositionControls)),
    ...inlineVideos.map(item => buildInlineVideoBlock(item, PRODUCT_VIDEO_LABELS, showPositionControls))
  ];

  const inlineBody = renderBodyWithInlineEmbeds(safeData.description || 'Nội dung sản phẩm đang cập nhật', inlineBlocks);

  const tagsHtml = (safeData.featureTags ?? []).length
    ? `<div class="preview-tags">${(safeData.featureTags ?? [])
        .map(tag => `<span class="preview-tag">${escapeHtml(tag)}</span>`)
        .join('')}</div>`
    : '';

  const highlightsHtml = (safeData.highlights ?? []).length
    ? `<div class="preview-highlights">
        <h3>Điểm nổi bật</h3>
        <ul>
          ${(safeData.highlights ?? [])
            .map(highlight => `<li><i class="fas fa-check-circle"></i><span>${escapeHtml(highlight)}</span></li>`)
            .join('')}
        </ul>
      </div>`
    : '';

  const galleryHtml = renderMediaSection(galleryMedia, 'Thư viện hình ảnh', PRODUCT_MEDIA_LABELS);
  const videoHtml = renderVideoSection(videoItems, 'Video demo', PRODUCT_VIDEO_LABELS);
  const demoCallout = renderDemoComboSection(safeData.demoMedia as DemoMediaItem[] | undefined);

  const footerSections = [tagsHtml, highlightsHtml].filter(Boolean).join('');
  const footerHtml = footerSections ? `<div class="preview-footer-panel">${footerSections}</div>` : '';

  return `
    <div class="live-preview-header">
      ${category}
      <h1>${title}</h1>
      ${safeData.shortDescription ? `<p class="preview-subtitle">${escapeHtml(safeData.shortDescription)}</p>` : ''}
    </div>
    ${heroImage}
    <div class="preview-body" data-paragraph-count="${inlineBody.paragraphCount}">${inlineBody.html}</div>
    ${demoCallout}
    ${galleryHtml}
    ${videoHtml}
    ${footerHtml}
  `;
}
