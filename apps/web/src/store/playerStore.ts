/**
 * Spotify-like Player Store
 * ------------------------
 * Manages playback lifecycle, robust queue handling, and synchronized state.
 */

import { create } from 'zustand'
import { Track } from '../../../../packages/shared/src/types/track'

export type PlaybackState = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error'
export type RepeatMode = 'off' | 'all' | 'one'

interface PlayerState {
  // Core State
  track: Track | null
  originalQueue: Track[]  // Canonical order
  playQueue: Track[]      // Active order (shuffled or original)
  playbackState: PlaybackState
  isPlaying: boolean      // Convenience alias for (playbackState === 'playing')
  error: string | null
  
  // Timing & Position
  progress: number        // 0.0 to 1.0 (Real time from engine)
  isSeeking: boolean      // UI is currently dragging the slider
  pendingProgress: number // Value currently being dragged to
  
  // Audio Settings
  volume: number
  isMuted: boolean
  shuffle: boolean
  repeat: RepeatMode

  // Actions: Transport
  play: (track: Track, queue?: Track[]) => void
  pause: () => void
  resume: () => void
  next: () => void
  prev: () => void
  togglePlay: () => void
  seek: (progress: number) => void
  
  // Actions: Internal State Sync (Called by AudioEngine)
  setPlaybackState: (state: PlaybackState) => void
  setProgress: (progress: number) => void
  reportError: (error: string, type?: string) => void
  
  // Actions: User Interaction
  setIsSeeking: (seeking: boolean) => void
  setPendingProgress: (progress: number) => void
  setVolume: (v: number) => void
  setMuted: (v: boolean) => void
  toggleMute: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  setQueue: (queue: Track[]) => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

export const normalizeTrack = (raw: any): Track => {
  const id = raw.id || raw.trackId
  // Ensure we have a valid duration, fallback to 0 if totally missing
  const duration = raw.duration || (raw.duration_ms ? raw.duration_ms / 1000 : 0) || 0;
  
  return {
    ...raw,
    id,
    artistName: raw.artistName || (typeof raw.artist === 'object' ? raw.artist?.name : raw.artist) || 'Unknown Artist',
    albumTitle: raw.albumTitle || raw.album?.title || 'Unknown Album',
    duration,
    audioUrl: raw.audioUrl || `/api/music/${id}/stream`,
    cover: raw.cover || raw.coverUrl || (raw.album?.coverArt) || `/api/music/${id}/cover`
  }
}

export const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const getArtistName = (track: Track | null) => track?.artistName || 'Unknown Artist'
export const getCoverUrl = (track: Track | null) => {
  if (!track) return ''
  return track.cover || `/api/music/${track.id}/cover`
}

/**
 * Fisher-Yates Shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Store Implementation ───────────────────────────────────────────────────

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  originalQueue: [],
  playQueue: [],
  playbackState: 'idle',
  isPlaying: false,
  error: null,
  progress: 0,
  isSeeking: false,
  pendingProgress: 0,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off',

  setPlaybackState: (playbackState) => {
    set({ playbackState, isPlaying: playbackState === 'playing' })
  },

  setProgress: (progress) => {
    // Only update progress if NOT seeking to prevent UI jitter
    if (!get().isSeeking) {
      set({ progress })
    }
  },

  reportError: (error, type = 'unspecified') => {
    const { track, playbackState } = get()
    console.error(`[Playback Telemetry] Error: ${error} Type: ${type} State: ${playbackState} Track: ${track?.id}`)
    set({ playbackState: 'error', error })
    
    // Future: Send to /api/telemetry
    if (track) {
      fetch('/api/admin/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: track.id,
          error,
          type,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        })
      }).catch(() => {}) // Silent fail for telemetry
    }
  },

  setIsSeeking: (isSeeking) => set({ isSeeking }),
  setPendingProgress: (pendingProgress) => set({ pendingProgress }),

  play: (rawTrack, rawQueue) => {
    const track = normalizeTrack(rawTrack)
    let originalQueue = rawQueue ? rawQueue.map(normalizeTrack) : get().originalQueue
    
    // Ensure the track is in the queue
    if (!originalQueue.find(t => t.id === track.id)) {
      originalQueue = [track, ...originalQueue]
    }

    let playQueue = [...originalQueue]
    if (get().shuffle) {
      // Keep current track at front, shuffle rest
      const others = originalQueue.filter(t => t.id !== track.id)
      playQueue = [track, ...shuffleArray(others)]
    }

    set({ 
      track, 
      originalQueue, 
      playQueue, 
      playbackState: 'loading',
      isPlaying: true, // Optimistically set playing to start engine
      progress: 0 
    })
    
    // Publish to Sync
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({
        type: 'TRACK_CHANGE',
        payload: {
          trackId: track.id,
          trackTitle: track.title,
          trackArtist: track.artistName,
          trackCover: track.cover,
          duration: track.duration,
          progress: 0
        }
      })
    })
  },

  pause: () => {
    get().setPlaybackState('paused')
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({ type: 'PAUSE', payload: {} })
    })
  },

  resume: () => {
    const { track } = get()
    if (!track) return
    
    get().setPlaybackState('playing')
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({
        type: 'PLAY',
        payload: {
          trackId: track.id,
          trackTitle: track.title,
          trackArtist: track.artistName,
          trackCover: track.cover,
          duration: track.duration,
          progress: get().progress
        }
      })
    })
  },

  togglePlay: () => {
    const { playbackState } = get()
    if (playbackState === 'playing') get().pause()
    else if (get().track) get().resume()
  },

  next: () => {
    const { track, playQueue, repeat } = get()
    if (!track || playQueue.length === 0) return

    if (repeat === 'one') {
      get().seek(0)
      get().resume()
      return
    }

    const currentIndex = playQueue.findIndex(t => t.id === track.id)
    let nextIndex = currentIndex + 1

    if (nextIndex >= playQueue.length) {
      if (repeat === 'all') nextIndex = 0
      else {
        get().setPlaybackState('ended')
        return
      }
    }

    get().play(playQueue[nextIndex])
  },

  prev: () => {
    const { track, playQueue, progress } = get()
    if (!track || playQueue.length === 0) return

    // Spotify rule: If more than 3 seconds in, restart the track
    if (progress * track.duration > 3) {
      get().seek(0)
      return
    }

    const currentIndex = playQueue.findIndex(t => t.id === track.id)
    let prevIndex = currentIndex - 1
    
    if (prevIndex < 0) {
      if (get().repeat === 'all') prevIndex = playQueue.length - 1
      else {
        get().seek(0)
        return
      }
    }

    get().play(playQueue[prevIndex])
  },

  seek: (progress) => {
    set({ progress, pendingProgress: progress })
    import('./syncStore').then(({ useSyncStore }) => {
      useSyncStore.getState().publish({
        type: 'SEEK',
        payload: { progress }
      })
    })
  },

  setVolume: (volume) => {
    set({ volume, isMuted: volume === 0 })
  },

  setMuted: (isMuted) => set({ isMuted }),
  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),

  toggleShuffle: () => {
    const { shuffle, track, originalQueue } = get()
    const nextShuffle = !shuffle
    
    let nextPlayQueue = [...originalQueue]
    if (nextShuffle && track) {
      const others = originalQueue.filter(t => t.id !== track.id)
      nextPlayQueue = [track, ...shuffleArray(others)]
    }
    
    set({ shuffle: nextShuffle, playQueue: nextPlayQueue })
  },

  toggleRepeat: () => {
    set(state => {
      const modes: RepeatMode[] = ['off', 'all', 'one']
      const nextIdx = (modes.indexOf(state.repeat) + 1) % modes.length
      return { repeat: modes[nextIdx] }
    })
  },

  setQueue: (queue) => {
    const normalized = queue.map(normalizeTrack)
    set({ 
      originalQueue: normalized, 
      playQueue: get().shuffle ? shuffleArray(normalized) : normalized 
    })
  }
}))
