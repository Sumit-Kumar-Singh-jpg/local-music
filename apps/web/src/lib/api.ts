/**
 * API Client — talks to Fastify backend at :3001 via Vite proxy at /api/*
 * Endpoints discovered from apps/api/src/routes:
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   GET  /api/music/search?q=
 *   GET  /api/music/trending
 *   GET  /api/music/stream/:id
 *   GET  /health
 */

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'API error')
  }
  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
}

// ── Music ─────────────────────────────────────────────────────────────────
export const musicApi = {
  search: (q: string) =>
    request<{ results: unknown[] }>(`/music/search?q=${encodeURIComponent(q)}`),

  trending: () =>
    request<{ tracks: unknown[] }>('/music/trending'),

  stream: (id: string) =>
    request<{ url: string }>(`/music/stream/${id}`),
}

// ── Health ────────────────────────────────────────────────────────────────
// NOTE: Vite proxies /api/* → :3001, so we call /api/health-check which
// the backend registers at /health — reached directly at :3001
export const healthCheck = () =>
  fetch('http://localhost:3001/health', { signal: AbortSignal.timeout(3000) })
    .then(r => r.json() as Promise<{ status: string; timestamp: string }>)
    .catch(() => ({ status: 'offline', timestamp: '' }))
