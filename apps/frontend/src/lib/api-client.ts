const DEFAULT_TIMEOUT = 12_000;

type NextRequestInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

function getBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
}

function buildUrl(path: string) {
  try {
    return new URL(path, getBaseUrl()).toString();
  } catch {
    return `${getBaseUrl()}${path}`;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions<TBody = unknown> {
  path: string;
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  nextOptions?: NextRequestInit;
  timeoutMs?: number;
  withAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export async function apiRequest<TResponse, TBody = unknown>(options: ApiRequestOptions<TBody>): Promise<TResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT);
  const url = buildUrl(options.path);

  const init: NextRequestInit = {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: controller.signal,
    credentials: options.withAuth === false ? 'omit' : 'include',
    ...options.nextOptions
  };

  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') ?? '';

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      let details: unknown;
      if (contentType.includes('application/json')) {
        try {
          const errorBody = await res.json();
          if (typeof errorBody?.message === 'string') {
            message = errorBody.message;
          }
          details = errorBody;
        } catch {
          // ignore JSON parse errors for malformed JSON
        }
      } else {
        const text = await res.text();
        if (text) {
          message = text;
          details = text;
        }
      }
      throw new ApiError(res.status, message, details);
    }

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return undefined as TResponse;
    }

    if (contentType.includes('application/json')) {
      return (await res.json()) as TResponse;
    }

    const text = await res.text();
    if (!text) {
      return undefined as TResponse;
    }

    try {
      return JSON.parse(text) as TResponse;
    } catch {
      return text as unknown as TResponse;
    }
  } finally {
    clearTimeout(timeout);
  }
}
