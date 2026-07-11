// Empty base URL uses the Vite dev proxy (same origin, no CORS).
// Set VITE_API_BASE_URL only when the API is on a different host (e.g. production).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: isFormData
      ? { ...(init?.headers ?? {}) }
      : {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const text = await res.text();
      if (text.trim()) {
        const body = JSON.parse(text);
        message = body?.message ?? body?.error ?? message;
      }
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  const text = await res.text();
  if (!text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

