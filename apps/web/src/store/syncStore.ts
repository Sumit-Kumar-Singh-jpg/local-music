import { create } from 'zustand'
import type { SyncEvent, ConnectedDevice } from '../../../../packages/shared/src/types/sync'

// ── Device Identity ───────────────────────────────────────────────────────
const DEVICE_ID_KEY  = 'lm-device-id'
const DEVICE_NAME_KEY = 'lm-device-name'

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
  socket: WebSocket | null
  myDeviceName: string

  init: () => void
  destroy: () => void
  publish: (event: Omit<SyncEvent, 'deviceId' | 'deviceName' | 'platform' | 'timestamp'>) => void
  transferTo: (deviceId: string) => void
  toggleSync: () => void
  setDeviceName: (name: string) => void
}

const STALE_MS = 30_000

export const useSyncStore = create<SyncState>((set, get) => ({
  connectedDevices: [],
  isSyncEnabled: true,
  socket: null,
  myDeviceName: localStorage.getItem(DEVICE_NAME_KEY) ?? getDefaultName(),

  init: () => {
    if (get().socket) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/api/sync/ws`
    
    console.log(`[Sync] Attempting connection to Solaris Connect: ${wsUrl}`)
    const socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('%c[Sync] SOLARIS CONNECT HUB: OPEN', 'color: #00ff00; font-weight: bold')
      
      // 2. Authenticate
      const authState = JSON.parse(localStorage.getItem('local-music-auth') || '{}')
      const token = authState?.state?.token
      
      if (token) {
        console.log('[Sync] Sending Auth Handshake...')
        socket.send(JSON.stringify({ 
          type: 'AUTH', 
          token, 
          deviceName: get().myDeviceName 
        }))
      }
      
      get().publish({ type: 'HEARTBEAT', payload: {} })
    }

    socket.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        
        // Handle explicit Hub responses
        if (event.type === 'AUTH_SUCCESS') {
          console.log('%c[Sync] AUTHENTICATED SUCCESSFULLY', 'color: #7c4dff; font-weight: bold')
          return
        }

        if (event.deviceId === MY_DEVICE_ID) return

        // Handle incoming transfer
        if (event.type === 'TRANSFER' && event.payload.trackId) {
          console.log(`%c[Sync] Incoming Transfer Hand-off: ${event.payload.trackTitle}`, 'color: #ff9100')
          import('./playerStore').then(({ usePlayerStore, normalizeTrack }) => {
            const store = usePlayerStore.getState()
            const trackData = store.playQueue.find(t => t.id === event.payload.trackId) ?? {
              id:         event.payload.trackId!,
              title:      event.payload.trackTitle  ?? 'Unknown Track',
              artistName: event.payload.trackArtist ?? 'Unknown Artist',
              duration:   event.payload.duration    ?? 0,
              cover:      event.payload.trackCover  ?? '',
            }
            store.play(normalizeTrack(trackData))
          })
          return
        }

        // Update device list
        set(state => {
          const existing = state.connectedDevices.find(d => d.deviceId === event.deviceId)
          if (event.type === 'DISCONNECT') {
            console.log(`[Sync] Device disconnected: ${event.deviceName}`)
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
              isPlaying: true,
            }
          }
          if (event.type === 'PAUSE' && updated.currentTrack) {
            updated.currentTrack = { ...updated.currentTrack, isPlaying: false }
          }
          
          return existing
            ? { connectedDevices: state.connectedDevices.map(d => d.deviceId === event.deviceId ? updated : d) }
            : { connectedDevices: [...state.connectedDevices, updated] }
        })
      } catch (err) {
        console.error('[Sync] Socket Message Error:', err)
      }
    }

    socket.onclose = (e) => {
      console.warn(`[Sync] CLOSED (Code: ${e.code}). Reconnecting in 5s...`)
      set({ socket: null })
      setTimeout(() => get().init(), 5000)
    }

    set({ socket })

    const heartbeatInterval = setInterval(() => {
      if (!get().isSyncEnabled) return
      get().publish({ type: 'HEARTBEAT', payload: {} })
      const now = Date.now()
      set(state => ({
        connectedDevices: state.connectedDevices.filter(d => now - d.lastSeen < STALE_MS),
      }))
    }, 20_000)

    window.addEventListener('beforeunload', () => {
      get().publish({ type: 'DISCONNECT', payload: {} })
      clearInterval(heartbeatInterval)
      socket.close()
    })
  },

  destroy: () => {
    get().publish({ type: 'DISCONNECT', payload: {} })
    get().socket?.close()
    set({ socket: null, connectedDevices: [] })
  },

  publish: (partial) => {
    const { socket, isSyncEnabled, myDeviceName } = get()
    if (!socket || socket.readyState !== WebSocket.OPEN || !isSyncEnabled) return

    const event: SyncEvent = {
      ...partial,
      deviceId:   MY_DEVICE_ID,
      deviceName: myDeviceName,
      platform:   'web',
      timestamp:  Date.now(),
    }
    socket.send(JSON.stringify(event))
  },

  transferTo: (deviceId) => {
    const { connectedDevices } = get()
    const target = connectedDevices.find(d => d.deviceId === deviceId)
    if (!target) return

    console.log(`[Sync] Initiating Transfer to device: ${target.deviceName}`)
    import('./playerStore').then(({ usePlayerStore }) => {
      const { track, pause, progress } = usePlayerStore.getState()
      pause()
      if (!track) return

      get().publish({
        type: 'TRANSFER',
        payload: {
          trackId:     track.id,
          trackTitle:  track.title,
          trackArtist: track.artistName,
          trackCover:  track.cover,
          duration:    track.duration,
          progress,
        },
      })
    })
  },

  toggleSync: () => set(s => ({ isSyncEnabled: !s.isSyncEnabled })),

  setDeviceName: (name: string) => {
    const trimmed = name.trim() || getDefaultName()
    localStorage.setItem(DEVICE_NAME_KEY, trimmed)
    set({ myDeviceName: trimmed })
    setTimeout(() => get().publish({ type: 'HEARTBEAT', payload: {} }), 50)
  },
}))
