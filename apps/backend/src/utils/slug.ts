import slugify from 'slugify';

export function generateSlug(input: string) {
  return slugify(input, {
    lower: true,
    strict: true,
    locale: 'vi'
  });
}

export function generateCode(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
