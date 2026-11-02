/** Base del API. Vacío en local (proxy Vite). En Vercel: URL del proyecto API. */
export const API_BASE = (import.meta.env.PUBLIC_API_URL || '').replace(/\/$/, '');

export function apiUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
