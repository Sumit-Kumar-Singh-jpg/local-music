import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'
import { Track } from '@local-music/shared/src/types/track'
import { BASE_URL } from '@/lib/api'

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

  play: (track: Track | any, queue?: Array<Track | any>) => void
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

const API_ORIGIN = BASE_URL.replace(/\/api$/, '')
let sound: Audio.Sound | null = null
let audioModeReady = false

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function getArtistName(track: any): string {
  if (track?.artistName) return track.artistName
  if (typeof track?.artist === 'string') return track.artist
  if (track?.artist?.name) return track.artist.name
  return 'Unknown Artist'
}

function getAlbumTitle(track: any): string {
  if (track?.albumTitle) return track.albumTitle
  if (typeof track?.album === 'string') return track.album
  if (track?.album?.title) return track.album.title
  return 'Single'
}

function getCover(track: any): string {
  return track?.cover || track?.coverUrl || track?.album?.coverArt || `https://picsum.photos/seed/${track?.id ?? 'track'}/400/400`
}

function resolveAudioUrl(track: any): string {
  const raw = (track?.audioUrl ?? '').toString().trim()
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  if (raw.startsWith('/api/')) return `${API_ORIGIN}${raw}`
  if (raw.startsWith('/')) return `${API_ORIGIN}${raw}`
  if (raw.length > 0) return `${API_ORIGIN}/${raw.replace(/^\/+/, '')}`
  return `${BASE_URL}/music/${track?.id}/stream`
}

function normalizeTrack(raw: any): Track {
  return {
    id: raw?.id ?? `${Date.now()}`,
    title: raw?.title ?? 'Untitled',
    artistId: raw?.artistId ?? raw?.artist?.id ?? 'unknown',
    artistName: getArtistName(raw),
    albumId: raw?.albumId ?? raw?.album?.id ?? undefined,
    albumTitle: getAlbumTitle(raw),
    duration: Math.max(0, Number(raw?.duration ?? 0)),
    isExplicit: Boolean(raw?.isExplicit ?? raw?.explicit ?? false),
    cover: getCover(raw),
    coverUrl: raw?.coverUrl ?? raw?.album?.coverArt ?? undefined,
    spotifyId: raw?.spotifyId ?? undefined,
    audioUrl: resolveAudioUrl(raw),
    hifi: Boolean(raw?.hifi ?? false),
    highQualityUrl: raw?.highQualityUrl ?? undefined,
    losslessUrl: raw?.losslessUrl ?? undefined,
    playCount: Number(raw?.playCount ?? 0),
    lyricsId: raw?.lyricsId ?? undefined,
    bpm: raw?.bpm ?? undefined,
    key: raw?.key ?? undefined,
    releaseDate: raw?.releaseDate ?? '',
  }
}

async function ensureAudioMode() {
  if (audioModeReady) return
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: true,
    staysActiveInBackground: true,
    playThroughEarpieceAndroid: false,
  })
  audioModeReady = true
}

async function unloadSound() {
  if (!sound) return
  try {
    sound.setOnPlaybackStatusUpdate(null)
    await sound.unloadAsync()
  } catch {
    // Ignore unload failures when replacing playback quickly.
  }
  sound = null
}

export const usePlayerStore = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    track: null,
    queue: DEMO_TRACKS,
    isPlaying: false,
    progress: 0,
    volume: 0.8,
    shuffle: false,
    repeat: 'off',
    isMuted: false,
    isMiniPlayerVisible: false,

    play: (rawTrack, rawQueue) => {
      const track = normalizeTrack(rawTrack)
      const queue = (rawQueue ?? get().queue).map(normalizeTrack)
      set({ track, queue, isPlaying: true, progress: 0, isMiniPlayerVisible: true })

      void (async () => {
        try {
          await ensureAudioMode()
          await unloadSound()
          sound = new Audio.Sound()
          sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            if (!status.isLoaded) return

            const durationMs = status.durationMillis ?? Math.round((get().track?.duration ?? 0) * 1000)
            const positionMs = status.positionMillis ?? 0
            const progress = durationMs > 0 ? clamp01(positionMs / durationMs) : 0
            const durationSec = durationMs > 0 ? Math.round(durationMs / 1000) : get().track?.duration ?? 0

            const currentTrack = get().track
            if (currentTrack && currentTrack.duration !== durationSec && durationSec > 0) {
              set({ track: { ...currentTrack, duration: durationSec } })
            }

            set({
              progress,
              isPlaying: status.isPlaying ?? false,
            })

            if (status.didJustFinish) {
              const { repeat } = get()
              if (repeat === 'one' && sound) {
                void sound.setPositionAsync(0).then(() => sound?.playAsync())
              } else {
                get().next()
              }
            }
          })

          await sound.loadAsync(
            { uri: track.audioUrl },
            {
              shouldPlay: true,
              positionMillis: 0,
              progressUpdateIntervalMillis: 250,
              volume: get().isMuted ? 0 : get().volume,
            },
            true,
          )
        } catch (error) {
          console.error('Playback failed:', error)
          set({ isPlaying: false })
        }
      })()
    },

    pause: () => {
      set({ isPlaying: false })
      if (sound) void sound.pauseAsync()
    },
    resume: () => {
      set({ isPlaying: true, isMiniPlayerVisible: true })
      if (sound) {
        void sound.playAsync().catch((error) => {
          console.error('Resume failed:', error)
          set({ isPlaying: false })
        })
      }
    },

    togglePlay: () => {
      const { isPlaying, track, queue } = get()
      if (!track && queue.length > 0) {
        get().play(queue[0], queue)
      } else if (isPlaying) {
        get().pause()
      } else {
        get().resume()
      }
    },

    next: () => {
      const { queue, track, shuffle } = get()
      if (!track || !queue.length) return
      const idx  = queue.findIndex(t => t.id === track.id)
      const next = shuffle
        ? queue[Math.floor(Math.random() * queue.length)]
        : queue[(idx + 1) % queue.length]
      get().play(next, queue)
    },

    prev: () => {
      const { queue, track } = get()
      if (!track || !queue.length) return
      const idx  = queue.findIndex(t => t.id === track.id)
      const prev = queue[(idx - 1 + queue.length) % queue.length]
      get().play(prev, queue)
    },

    seek: (progress) => {
      const safe = clamp01(progress)
      set({ progress: safe })
      if (sound) {
        void (async () => {
          try {
            const status = await sound.getStatusAsync()
            if (!status.isLoaded) return
            const durationMs = status.durationMillis ?? Math.round((get().track?.duration ?? 0) * 1000)
            if (!durationMs || durationMs <= 0) return
            await sound.setPositionAsync(Math.floor(safe * durationMs))
          } catch (error) {
            console.error('Seek failed:', error)
          }
        })()
      }
    },
    setVolume: (volume) => {
      const safe = clamp01(volume)
      set({ volume: safe, isMuted: safe === 0 })
      if (sound) void sound.setVolumeAsync(safe)
    },
    toggleShuffle: ()         => set(s => ({ shuffle: !s.shuffle })),
    toggleRepeat:  ()         => set(s => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
    toggleMute: () => {
      const { isMuted, volume } = get()
      const nextMuted = !isMuted
      set({ isMuted: nextMuted })
      if (sound) void sound.setVolumeAsync(nextMuted ? 0 : volume)
    },
  }))
)

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
