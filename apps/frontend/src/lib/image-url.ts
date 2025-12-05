const DRIVE_FILE_PATH_REGEX = /\/file\/d\/([^/]+)/; 
const DRIVE_ID_REGEX = /^[a-zA-Z0-9_-]{16,}$/;
const DRIVE_DIRECT_HOSTS = new Set([
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
  'drive-thirdparty.googleusercontent.com'
]);
const DRIVE_HOSTS = new Set(['drive.google.com', 'docs.google.com']);

export type DriveExportMode = 'view' | 'download';

export interface NormalizeImageUrlOptions {
  fallback?: string;
  allowFileId?: boolean;
  driveExport?: DriveExportMode;
}

export function buildGoogleDrivePreviewUrl(fileId: string, mode: DriveExportMode = 'view') {
  return `https://drive.google.com/uc?export=${mode}&id=${fileId}`;
}

export function extractGoogleDriveId(candidate?: string | null): string | null {
  if (!candidate) {
    return null;
  }
  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  const directMatch = trimmed.match(DRIVE_FILE_PATH_REGEX);
  if (directMatch?.[1]) {
    return directMatch[1];
  }

  const url = safeParseUrl(trimmed);
  if (!url) {
    return DRIVE_ID_REGEX.test(trimmed) ? trimmed : null;
  }

  if (DRIVE_FILE_PATH_REGEX.test(url.pathname)) {
    const match = url.pathname.match(DRIVE_FILE_PATH_REGEX);
    if (match?.[1]) {
      return match[1];
    }
  }

  const pathSegments = url.pathname.split('/').filter(Boolean);
  const dIndex = pathSegments.indexOf('d');
  if (dIndex >= 0 && pathSegments[dIndex + 1]) {
    return pathSegments[dIndex + 1];
  }

  const idFromQuery = url.searchParams.get('id') || url.searchParams.get('ids');
  if (idFromQuery) {
    return idFromQuery;
  }

  return null;
}

export function normalizeImageUrl(value?: string | null, options: NormalizeImageUrlOptions = {}) {
  const fallback = options.fallback ?? '';
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  if (/^(data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return normalizeImageUrl(`https:${trimmed}`, options);
  }

  if (isRelativePath(trimmed)) {
    return trimmed;
  }

  const parsed = safeParseUrl(trimmed);
  if (!parsed) {
    if (options.allowFileId !== false && DRIVE_ID_REGEX.test(trimmed)) {
      return buildGoogleDrivePreviewUrl(trimmed, options.driveExport);
    }
    return trimmed;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (DRIVE_DIRECT_HOSTS.has(hostname)) {
    return parsed.href;
  }

  if (DRIVE_HOSTS.has(hostname)) {
    const fileId = extractGoogleDriveId(parsed.href);
    if (fileId) {
      return buildGoogleDrivePreviewUrl(fileId, options.driveExport);
    }
  }

  return parsed.href || trimmed;
}

function safeParseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isRelativePath(value: string) {
  return value.startsWith('/') || value.startsWith('./') || value.startsWith('../');
}
