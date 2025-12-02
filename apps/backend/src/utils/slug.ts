import slugify from 'slugify';

type SlugEntity = 'blog' | 'product';

function formatTimestamp(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return [
    date.getFullYear().toString(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('');
}

function needsSuffix(slug: string, entity: SlugEntity) {
  const suffix = entity === 'blog' ? 'blog' : 'prod';
  const pattern = new RegExp(`-${suffix}\\d{14}$`);
  return !pattern.test(slug);
}

export function generateSlug(input: string, options?: { entity?: SlugEntity }) {
  const baseValue = (input || '').trim() || 'noi-dung';
  const normalized = slugify(baseValue, {
    lower: true,
    strict: true,
    locale: 'vi'
  }).replace(/-+/g, '-');

  if (!options?.entity) {
    return normalized;
  }

  const sanitized = normalized.replace(/^-+|-+$/g, '') || options.entity;
  if (needsSuffix(sanitized, options.entity)) {
    const suffixKey = options.entity === 'blog' ? 'blog' : 'prod';
    return `${sanitized}-${suffixKey}${formatTimestamp(new Date())}`;
  }
  return sanitized;
}

export function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
