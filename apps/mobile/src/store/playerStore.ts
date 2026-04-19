import { create } from 'zustand'
import { Track } from '@local-music/shared/src/types/track'

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
  { id: '1', title: 'Midnight City',   artistId: 'm83',    artistName: 'M83',           albumTitle: "Hurry Up, We're Dreaming", duration: 244, cover: 'https://picsum.photos/seed/t1/400/400', hifi: true, isExplicit: false, audioUrl: '', playCount: 0, releaseDate: ''  },
  { id: '2', title: 'Blinding Lights', artistId: 'wknd',   artistName: 'The Weeknd',    albumTitle: 'After Hours',               duration: 200, cover: 'https://picsum.photos/seed/t2/400/400', hifi: true, isExplicit: false, audioUrl: '', playCount: 0, releaseDate: ''  },
  { id: '3', title: 'Save Your Tears', artistId: 'wknd',   artistName: 'The Weeknd',    albumTitle: 'After Hours',               duration: 215, cover: 'https://picsum.photos/seed/t3/400/400', isExplicit: false, audioUrl: '', playCount: 0, releaseDate: ''              },
  { id: '4', title: 'Levitating',      artistId: 'dua',    artistName: 'Dua Lipa',      albumTitle: 'Future Nostalgia',          duration: 203, cover: 'https://picsum.photos/seed/t4/400/400', hifi: true, isExplicit: false, audioUrl: '', playCount: 0, releaseDate: ''  },
  { id: '5', title: 'Stay',            artistId: 'laroi',  artistName: 'The Kid LAROI', albumTitle: 'F*ck Love 3',               duration: 141, cover: 'https://picsum.photos/seed/t5/400/400', isExplicit: true, audioUrl: '', playCount: 0, releaseDate: '' },
  { id: '6', title: 'Heat Waves',      artistId: 'glass',  artistName: 'Glass Animals', albumTitle: 'Dreamland',                 duration: 238, cover: 'https://picsum.photos/seed/t6/400/400', hifi: true, isExplicit: false, audioUrl: '', playCount: 0, releaseDate: ''  },
  { id: '7', title: 'As It Was',       artistId: 'harry',  artistName: 'Harry Styles',  albumTitle: "Harry's House",             duration: 167, cover: 'https://picsum.photos/seed/t7/400/400', hifi: true, isExplicit: false, audioUrl: '', playCount: 0, releaseDate: ''  },
  { id: '8', title: 'Anti-Hero',       artistId: 'taylor', artistName: 'Taylor Swift',  albumTitle: 'Midnights',                 duration: 200, cover: 'https://picsum.photos/seed/t8/400/400', hifi: true, isExplicit: false, audioUrl: '', playCount: 0, releaseDate: ''  },
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
