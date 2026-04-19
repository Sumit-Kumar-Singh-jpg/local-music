import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist: string | { name: string; id?: string }
  album: string | { title?: string; coverArt?: string; id?: string }
  duration: number // seconds
  cover?: string
  audioUrl?: string
  explicit?: boolean
  isExplicit?: boolean
  hifi?: boolean
  playCount?: number
}

interface PlayerState {
  track: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number // 0-1
  volume: number  // 0-1
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  isMuted: boolean

  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void
  setVolume: (volume: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleMute: () => void
}

export const DEMO_TRACKS: Track[] = []

const audioEl = new Audio()
audioEl.crossOrigin = 'anonymous'

// Lazy import to avoid circular deps — syncStore uses playerStore state but not the store itself
function syncPublish(type: string, payload: Record<string, unknown>) {
  try {
    // Dynamic import at runtime avoids circular dependency at module load time
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({ type: type as any, payload })
    })
  } catch { /* sync not available */ }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'off',
  isMuted: false,

  play: (track, queue) => {
    if (track.audioUrl) {
      audioEl.src = track.audioUrl
      audioEl.play().catch(console.error)
    }
    set({ track, queue: queue ?? get().queue, isPlaying: true, progress: 0 })
    syncPublish('TRACK_CHANGE', {
      trackId: track.id,
      trackTitle: track.title,
      trackArtist: typeof track.artist === 'string' ? track.artist : track.artist?.name,
      trackCover: track.cover,
      progress: 0,
    })
  },

  pause: () => {
    audioEl.pause()
    set({ isPlaying: false })
    syncPublish('PAUSE', { progress: get().progress })
  },

  resume: () => {
    audioEl.play().catch(console.error)
    set({ isPlaying: true })
    const t = get().track
    if (t) syncPublish('PLAY', {
      trackId: t.id,
      trackTitle: t.title,
      trackArtist: typeof t.artist === 'string' ? t.artist : t.artist?.name,
      trackCover: t.cover,
      progress: get().progress,
    })
  },

  togglePlay: () => {
    const { isPlaying, track, queue } = get()
    if (!track && queue.length > 0) {
      get().play(queue[0], queue)
    } else {
      if (isPlaying) get().pause()
      else get().resume()
    }
  },

  next: () => {
    const { queue, track, shuffle } = get()
    if (!track || queue.length === 0) return
    const idx = queue.findIndex(t => t.id === track.id)
    const next = shuffle
      ? queue[Math.floor(Math.random() * queue.length)]
      : queue[(idx + 1) % queue.length]
    get().play(next, queue)
  },

  prev: () => {
    const { queue, track } = get()
    if (!track || queue.length === 0) return
    const idx = queue.findIndex(t => t.id === track.id)
    const prev = queue[(idx - 1 + queue.length) % queue.length]
    get().play(prev, queue)
  },

  seek: (progress) => {
    if (audioEl.duration) {
      audioEl.currentTime = progress * audioEl.duration
    }
    set({ progress })
    syncPublish('SEEK', { progress })
  },

  setVolume: (volume) => {
    audioEl.volume = volume
    set({ volume, isMuted: volume === 0 })
    syncPublish('VOLUME', { volume })
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  toggleRepeat:  () => set(s => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
  toggleMute:    () => set(s => ({ isMuted: !s.isMuted })),
}))

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

audioEl.addEventListener('timeupdate', () => {
  if (audioEl.duration) {
    usePlayerStore.setState({ progress: audioEl.currentTime / audioEl.duration })
  }
})

audioEl.addEventListener('ended', () => {
  usePlayerStore.getState().next()
})
