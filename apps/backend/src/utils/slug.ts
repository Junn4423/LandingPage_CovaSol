import slugify from 'slugify';

export function generateSlug(input: string) {
  return slugify(input, {
    lower: true,
    strict: true,
    locale: 'vi'
  });
}
