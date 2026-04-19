/**
 * API Client — talks to Fastify backend at :3001 via Vite proxy at /api/*
 */

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authState = JSON.parse(localStorage.getItem('local-music-auth') || '{}')
  const token = authState?.state?.token

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? err.error ?? 'API error')
  }
  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (identifier: string, password: string) =>
    request<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  register: (name: string, email: string, password: string, username: string) =>
    request<{ token: string; user: Record<string, unknown> }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, username }),
    }),

  forgotPassword: (identifier: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),
}

// ── Music ─────────────────────────────────────────────────────────────────
export const musicApi = {
  search: (q: string) =>
    request<{ results: any[] }>(`/search/tracks?q=${encodeURIComponent(q)}`),

  trending: () =>
    request<{ tracks: any[] }>('/music/trending'),

  getTrack: (id: string) =>
    request<{ track: any }>(`/music/${id}`),

  getAlbum: (id: string) =>
    request<{ album: any }>(`/tracks/album/${id}`),

  getArtist: (id: string) =>
    request<{ artist: any }>(`/artists/${id}`),
}

// ── Library ───────────────────────────────────────────────────────────────
export const libraryApi = {
  getLikedTracks: () =>
    request<{ tracks: any[] }>('/library/likes'),

  likeTrack: (trackId: string) =>
    request<{ success: boolean }>('/library/like', {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    }),

  unlikeTrack: (trackId: string) =>
    request<{ success: boolean }>('/library/unlike', {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    }),
}

// ── Playlists ─────────────────────────────────────────────────────────────
export const playlistApi = {
  list: () =>
    request<{ playlists: any[] }>('/playlists'),

  get: (id: string) =>
    request<{ playlist: any }>(`/playlists/${id}`),

  create: (name: string, description?: string) =>
    request<{ playlist: any }>('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  addTrack: (playlistId: string, trackId: string) =>
    request<{ success: boolean }>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    }),

  removeTrack: (playlistId: string, trackId: string) =>
    request<{ success: boolean }>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    }),
}

// ── Users ─────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () =>
    request<{ user: any }>('/users/me'),

  updateProfile: (updates: { displayName?: string; avatarUrl?: string }) =>
    request<{ user: any }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
}

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    request<{ stats: any }>('/admin/stats'),

  getUsers: (limit = 10) =>
    request<{ users: any[] }>(`/admin/users?limit=${limit}`),
}

// ── Health ────────────────────────────────────────────────────────────────
export const healthCheck = () =>
  fetch('http://localhost:3001/health', { signal: AbortSignal.timeout(3000) })
    .then(r => r.json() as Promise<{ status: string; timestamp: string }>)
    .catch(() => ({ status: 'offline', timestamp: '' }))
