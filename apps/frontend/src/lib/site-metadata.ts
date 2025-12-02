const FALLBACK_SITE_URL = 'http://localhost:3000';

function sanitizeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
  ];
  const resolved = candidates.find(Boolean) ?? FALLBACK_SITE_URL;
  return sanitizeUrl(resolved);
}
