/**
 * Shared SyncEvent type — used by both web (BroadcastChannel) and
 * eventually mobile (WebSocket/SSE when backend adds it).
 */
export interface SyncEvent {
  type: 'PLAY' | 'PAUSE' | 'SEEK' | 'TRACK_CHANGE' | 'VOLUME' | 'HEARTBEAT' | 'DISCONNECT' | 'TRANSFER'
  payload: {
    trackId?: string
    trackTitle?: string
    trackArtist?: string
    trackCover?: string
    progress?: number
    volume?: number
    duration?: number
  }
  deviceId: string
  deviceName: string
  platform: 'web' | 'mobile' | 'desktop'
  timestamp: number
}

export interface ConnectedDevice {
  deviceId: string
  deviceName: string
  platform: 'web' | 'mobile' | 'desktop'
  lastSeen: number
  currentTrack?: {
    id: string
    title: string
    artist: string
    cover: string
    progress: number
    isPlaying: boolean
  }
}
