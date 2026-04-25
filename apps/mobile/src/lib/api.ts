/**
 * Mobile API client — connects to the Local Music backend at :3001
 * Mirrors the route structure and method names from apps/web/src/lib/api.ts
 *
 * During dev: Android emulator reaches host machine via 10.0.2.2
 * Real device / Expo Go: update BASE_URL to your machine's LAN IP
 */

import { User } from '@local-music/shared/src/types/user'
import { Track, Album as AlbumType } from '@local-music/shared/src/types/track'

// 192.168.220.98 is the LAN IP of your host machine found in recent server logs.
// Update this if your network IP changes.
export const BASE_URL = __DEV__
  ? 'http://192.168.220.98:3001/api'  // Physical Device / Expo Go → host machine
  : 'https://api.localmusic.app'      // production (placeholder)

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
    throw new Error(err.message ?? err.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('POST', '/auth/login', { identifier: email, password }),

  register: (name: string, email: string, password: string, username: string) =>
    request<{ token: string; user: User }>('POST', '/auth/register', { name, email, password, username }),
}

// ── Music ─────────────────────────────────────────────────────────────────
export const musicApi = {
  trending: () =>
    request<{ tracks: Track[] }>('GET', '/music/trending'),

  streamUrl: (id: string) => `${BASE_URL}/music/${id}/stream`,
  
  coverUrl: (id: string) => `${BASE_URL}/music/${id}/cover`,

  search: (q: string) =>
    request<{ results: Track[] }>('GET', `/search/tracks?q=${encodeURIComponent(q)}`),

  getTrack: (id: string) =>
    request<{ track: Track }>('GET', `/music/${id}`),

  getAlbum: (id: string) =>
    request<{ album: any, tracks: Track[] }>('GET', `/albums/${id}`),

  getArtist: (id: string) =>
    request<{ artist: any }>('GET', `/artists/${id}`),
}

// ── Playlists ─────────────────────────────────────────────────────────────
export const playlistApi = {
  list: () =>
    request<{ playlists: any[] }>('GET', '/playlists'),

  get: (id: string) =>
    request<{ playlist: any }>('GET', `/playlists/${id}`),

  create: (name: string, description?: string) =>
    request<{ playlist: any }>('POST', '/playlists', { name, description }),

  addTrack: (playlistId: string, trackId: string) =>
    request<{ success: boolean }>('POST', `/playlists/${playlistId}/tracks`, { trackId }),
}

// ── Users ─────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () =>
    request<{ user: User }>('GET', '/users/me'),

  updateProfile: (updates: { displayName?: string; avatarUrl?: string }) =>
    request<{ user: User }>('PUT', '/users/me', updates),
}

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    request<{ stats: any }>('GET', '/admin/stats'),

  getTasks: () =>
    request<{ tasks: any[] }>('GET', '/admin/tasks'),

  addPlaylist: (url: string) =>
    request<{ success: boolean }>('POST', '/admin/add-playlist', { url }),

  stopTask: (id: string) =>
    request<{ success: boolean }>('POST', `/admin/tasks/${id}/stop`, {}),
}

// ── Health ────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () =>
    request<{ status: string }>('GET', '/health'),
}
