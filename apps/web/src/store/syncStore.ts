import { create } from 'zustand'
import type { SyncEvent, ConnectedDevice } from '../../../../packages/shared/src/types/sync'

// ── Device Identity ───────────────────────────────────────────────────────
const DEVICE_ID_KEY  = 'lm-device-id'
const DEVICE_NAME_KEY = 'lm-device-name'
const CHANNEL_NAME   = 'lm-sync-v1'

function generateDeviceId(): string {
  return `web-${Math.random().toString(36).slice(2, 10)}`
}

function getDefaultName(): string {
  const ua = navigator.userAgent
  if (ua.includes('Chrome'))  return 'Chrome Tab'
  if (ua.includes('Firefox')) return 'Firefox Tab'
  if (ua.includes('Safari'))  return 'Safari Tab'
  return 'Browser Tab'
}

function getOrCreateDeviceId(): string {
  let id = sessionStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = generateDeviceId()
    sessionStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export const MY_DEVICE_ID = getOrCreateDeviceId()

// ── Store ─────────────────────────────────────────────────────────────────
interface SyncState {
  connectedDevices: ConnectedDevice[]
  isSyncEnabled: boolean
  channel: BroadcastChannel | null
  // ← Now reactive, not a module constant
  myDeviceName: string

  init: () => void
  destroy: () => void
  publish: (event: Omit<SyncEvent, 'deviceId' | 'deviceName' | 'platform' | 'timestamp'>) => void
  transferTo: (deviceId: string) => void
  toggleSync: () => void
  /** Saves to localStorage AND updates reactive state so the UI re-renders instantly */
  setDeviceName: (name: string) => void
}

const STALE_MS = 15_000

export const useSyncStore = create<SyncState>((set, get) => ({
  connectedDevices: [],
  isSyncEnabled: true,
  channel: null,
  // Initialise from localStorage — this field is reactive
  myDeviceName: localStorage.getItem(DEVICE_NAME_KEY) ?? getDefaultName(),

  init: () => {
    if (get().channel) return
    const ch = new BroadcastChannel(CHANNEL_NAME)

    ch.onmessage = (e: MessageEvent<SyncEvent>) => {
      const event = e.data
      if (event.deviceId === MY_DEVICE_ID) return

      // ── TRANSFER received — this tab was asked to start playing ──
      if (event.type === 'TRANSFER' && event.payload.trackId) {
        // Dynamically import playerStore to start playing the handed-off track
        import('./playerStore').then(({ usePlayerStore }) => {
          const store = usePlayerStore.getState()
          // Find the track in the current queue; fall back to event payload info
          const track = store.queue.find(t => t.id === event.payload.trackId) ?? {
            id:       event.payload.trackId!,
            title:    event.payload.trackTitle  ?? 'Unknown Track',
            artist:   event.payload.trackArtist ?? 'Unknown Artist',
            album:    '',
            duration: event.payload.duration    ?? 0,
            cover:    event.payload.trackCover  ?? '',
          }
          store.play(track)
        })
        return
      }

      set(state => {
        const existing = state.connectedDevices.find(d => d.deviceId === event.deviceId)

        if (event.type === 'DISCONNECT') {
          return { connectedDevices: state.connectedDevices.filter(d => d.deviceId !== event.deviceId) }
        }

        const updated: ConnectedDevice = {
          deviceId:    event.deviceId,
          deviceName:  event.deviceName,
          platform:    event.platform,
          lastSeen:    event.timestamp,
          currentTrack: existing?.currentTrack,
        }

        if (['PLAY', 'TRACK_CHANGE'].includes(event.type) && event.payload.trackId) {
          updated.currentTrack = {
            id:       event.payload.trackId,
            title:    event.payload.trackTitle  ?? '',
            artist:   event.payload.trackArtist ?? '',
            cover:    event.payload.trackCover  ?? '',
            progress: event.payload.progress    ?? 0,
            isPlaying: event.type === 'PLAY' || event.type === 'TRACK_CHANGE',
          }
        }
        if (event.type === 'PAUSE' && updated.currentTrack) {
          updated.currentTrack = { ...updated.currentTrack, isPlaying: false }
        }
        if (event.type === 'SEEK' && updated.currentTrack) {
          updated.currentTrack = { ...updated.currentTrack, progress: event.payload.progress ?? 0 }
        }

        return existing
          ? { connectedDevices: state.connectedDevices.map(d => d.deviceId === event.deviceId ? updated : d) }
          : { connectedDevices: [...state.connectedDevices, updated] }
      })
    }

    set({ channel: ch })

    const heartbeatInterval = setInterval(() => {
      if (!get().isSyncEnabled) return
      get().publish({ type: 'HEARTBEAT', payload: {} })
      const now = Date.now()
      set(state => ({
        connectedDevices: state.connectedDevices.filter(d => now - d.lastSeen < STALE_MS),
      }))
    }, 10_000)

    get().publish({ type: 'HEARTBEAT', payload: {} })

    window.addEventListener('beforeunload', () => {
      get().publish({ type: 'DISCONNECT', payload: {} })
      clearInterval(heartbeatInterval)
      ch.close()
    })
  },

  destroy: () => {
    get().publish({ type: 'DISCONNECT', payload: {} })
    get().channel?.close()
    set({ channel: null, connectedDevices: [] })
  },

  publish: (partial) => {
    const { channel, isSyncEnabled, myDeviceName } = get()
    if (!channel || !isSyncEnabled) return

    const event: SyncEvent = {
      ...partial,
      deviceId:   MY_DEVICE_ID,
      deviceName: myDeviceName,      // ← always uses current reactive name
      platform:   'web',
      timestamp:  Date.now(),
    }
    channel.postMessage(event)
  },

  /**
   * Transfer: pause this tab, then broadcast TRANSFER so the target tab
   * picks up the current track and starts playing it.
   */
  transferTo: (deviceId) => {
    const { connectedDevices } = get()
    const target = connectedDevices.find(d => d.deviceId === deviceId)
    if (!target) return

    // Get current player state to hand off
    import('./playerStore').then(({ usePlayerStore }) => {
      const { track, pause, progress } = usePlayerStore.getState()

      // 1. Pause this device
      pause()

      if (!track) return

      // 2. Broadcast TRANSFER event — the target tab's ch.onmessage handles it
      get().publish({
        type: 'TRANSFER',
        payload: {
          trackId:     track.id,
          trackTitle:  track.title,
          trackArtist: typeof track.artist === 'object' ? track.artist?.name : track.artist,
          trackCover:  track.cover,
          duration:    track.duration,
          progress,
        },
      })
    })
  },

  toggleSync: () => set(s => ({ isSyncEnabled: !s.isSyncEnabled })),

  /**
   * Rename: persist to localStorage AND update reactive Zustand state.
   * Components reading `myDeviceName` from the store will re-render immediately.
   */
  setDeviceName: (name: string) => {
    const trimmed = name.trim() || getDefaultName()
    localStorage.setItem(DEVICE_NAME_KEY, trimmed)
    set({ myDeviceName: trimmed })             // ← triggers re-render
    // Re-announce with new name so other tabs update their device list
    setTimeout(() => get().publish({ type: 'HEARTBEAT', payload: {} }), 50)
  },
}))
