import { config } from '../config';
import { logger } from '../logger';

const SEARCH_ENGINE_ENDPOINTS = [
  'https://www.google.com/ping?sitemap=',
  'https://www.bing.com/ping?sitemap='
];

function buildSitemapUrl(): string | null {
  if (!config.siteUrl) {
    return null;
  }

  try {
    return new URL('/sitemap.xml', config.siteUrl).toString();
  } catch (error) {
    logger.warn({ err: error }, 'Không thể tạo URL sitemap hợp lệ');
    return null;
  }
}

/**
 * Ping các công cụ tìm kiếm khi sitemap thay đổi. Không throw lỗi để tránh chặn luồng chính.
 */
export async function notifySitemapUpdated(context?: string) {
  const sitemapUrl = buildSitemapUrl();
  if (!sitemapUrl) {
    logger.warn('Bỏ qua thông báo sitemap do chưa cấu hình SITE_URL');
    return;
  }

  const encoded = encodeURIComponent(sitemapUrl);

  await Promise.allSettled(
    SEARCH_ENGINE_ENDPOINTS.map(async endpoint => {
      try {
        const response = await fetch(`${endpoint}${encoded}`);
        if (!response.ok) {
          throw new Error(`Ping ${endpoint} thất bại với mã ${response.status}`);
        }
        logger.debug(
          {
            endpoint,
            sitemapUrl,
            context
          },
          'Đã gửi thông báo sitemap thành công'
        );
      } catch (error) {
        logger.warn(
          {
            err: error,
            endpoint,
            context
          },
          'Không thể ping công cụ tìm kiếm'
        );
      }
    })
  );
}
