/**
 * Mobile API client — connects to the Local Music backend at :3001
 * Mirrors the route structure from apps/api/src/routes/*
 *
 * During dev: Android emulator reaches host machine via 10.0.2.2
 * Real device / Expo Go: update BASE_URL to your machine's LAN IP
 */

const BASE_URL = __DEV__
  ? 'http://10.0.2.2:3001/api'   // Android emulator → host machine
  : 'https://api.localmusic.app' // production (placeholder)

let _authToken: string | null = null

export function setAuthToken(token: string | null) {
  _authToken = token
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (_authToken) headers['Authorization'] = `Bearer ${_authToken}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: unknown }>('POST', '/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: unknown }>('POST', '/auth/register', { name, email, password }),
}

// ── Music ─────────────────────────────────────────────────────────────────
export const musicApi = {
  trending: () =>
    request<{ tracks: unknown[] }>('GET', '/music/trending'),

  stream: (id: string) =>
    request<{ url: string }>('GET', `/music/stream/${id}`),

  search: (q: string) =>
    request<{ results: unknown[] }>('GET', `/music/search?q=${encodeURIComponent(q)}`),
}

// ── Tracks ────────────────────────────────────────────────────────────────
export const tracksApi = {
  getAll: () =>
    request<{ tracks: unknown[] }>('GET', '/tracks'),

  getById: (id: string) =>
    request<unknown>('GET', `/tracks/${id}`),
}

// ── Albums ────────────────────────────────────────────────────────────────
export const albumsApi = {
  getAll: () =>
    request<{ albums: unknown[] }>('GET', '/albums'),

  getById: (id: string) =>
    request<unknown>('GET', `/albums/${id}`),
}

// ── Artists ───────────────────────────────────────────────────────────────
export const artistsApi = {
  getAll: () =>
    request<{ artists: unknown[] }>('GET', '/artists'),

  getById: (id: string) =>
    request<unknown>('GET', `/artists/${id}`),
}

// ── Playlists ─────────────────────────────────────────────────────────────
export const playlistsApi = {
  getAll: () =>
    request<{ playlists: unknown[] }>('GET', '/playlists'),

  getById: (id: string) =>
    request<unknown>('GET', `/playlists/${id}`),

  create: (name: string, description?: string) =>
    request<unknown>('POST', '/playlists', { name, description }),

  addTrack: (playlistId: string, trackId: string) =>
    request<unknown>('POST', `/playlists/${playlistId}/tracks`, { trackId }),
}

// ── Search ────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string) =>
    request<{ results: unknown[] }>('GET', `/search?q=${encodeURIComponent(q)}`),
}

// ── Health ────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () =>
    request<{ status: string }>('GET', '/health'),
}
