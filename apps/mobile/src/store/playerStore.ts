import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  cover: string
  explicit?: boolean
  hifi?: boolean
}

interface PlayerState {
  track: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number   // 0-1
  volume: number     // 0-1
  shuffle: boolean
  repeat: 'off' | 'one' | 'all'
  isMuted: boolean
  isMiniPlayerVisible: boolean

  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (progress: number) => void
  setVolume: (v: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleMute: () => void
}

export const DEMO_TRACKS: Track[] = [
  { id: '1', title: 'Midnight City',   artist: 'M83',           album: "Hurry Up, We're Dreaming", duration: 244, cover: 'https://picsum.photos/seed/t1/400/400', hifi: true  },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd',    album: 'After Hours',               duration: 200, cover: 'https://picsum.photos/seed/t2/400/400', hifi: true  },
  { id: '3', title: 'Save Your Tears', artist: 'The Weeknd',    album: 'After Hours',               duration: 215, cover: 'https://picsum.photos/seed/t3/400/400'              },
  { id: '4', title: 'Levitating',      artist: 'Dua Lipa',      album: 'Future Nostalgia',          duration: 203, cover: 'https://picsum.photos/seed/t4/400/400', hifi: true  },
  { id: '5', title: 'Stay',            artist: 'The Kid LAROI', album: 'F*ck Love 3',               duration: 141, cover: 'https://picsum.photos/seed/t5/400/400', explicit: true },
  { id: '6', title: 'Heat Waves',      artist: 'Glass Animals', album: 'Dreamland',                 duration: 238, cover: 'https://picsum.photos/seed/t6/400/400', hifi: true  },
  { id: '7', title: 'As It Was',       artist: 'Harry Styles',  album: "Harry's House",             duration: 167, cover: 'https://picsum.photos/seed/t7/400/400', hifi: true  },
  { id: '8', title: 'Anti-Hero',       artist: 'Taylor Swift',  album: 'Midnights',                 duration: 200, cover: 'https://picsum.photos/seed/t8/400/400', hifi: true  },
]

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: DEMO_TRACKS,
  isPlaying: false,
  progress: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'off',
  isMuted: false,
  isMiniPlayerVisible: false,

  play: (track, queue) =>
    set({ track, queue: queue ?? get().queue, isPlaying: true, progress: 0, isMiniPlayerVisible: true }),

  pause:  () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  togglePlay: () => {
    const { isPlaying, track, queue } = get()
    if (!track && queue.length > 0) set({ track: queue[0], isPlaying: true, isMiniPlayerVisible: true })
    else set({ isPlaying: !isPlaying })
  },

  next: () => {
    const { queue, track, shuffle } = get()
    if (!track || !queue.length) return
    const idx  = queue.findIndex(t => t.id === track.id)
    const next = shuffle
      ? queue[Math.floor(Math.random() * queue.length)]
      : queue[(idx + 1) % queue.length]
    set({ track: next, progress: 0, isPlaying: true })
  },

  prev: () => {
    const { queue, track } = get()
    if (!track || !queue.length) return
    const idx  = queue.findIndex(t => t.id === track.id)
    const prev = queue[(idx - 1 + queue.length) % queue.length]
    set({ track: prev, progress: 0, isPlaying: true })
  },

  seek:          (progress) => set({ progress }),
  setVolume:     (volume)   => set({ volume, isMuted: volume === 0 }),
  toggleShuffle: ()         => set(s => ({ shuffle: !s.shuffle })),
  toggleRepeat:  ()         => set(s => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
  toggleMute:    ()         => set(s => ({ isMuted: !s.isMuted })),
}))

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
