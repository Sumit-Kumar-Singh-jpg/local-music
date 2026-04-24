import { Audio } from 'expo-av'
import { usePlayerStore } from '../store/playerStore'
import { BASE_URL } from '../lib/api'

let sound: Audio.Sound | null = null

// Helper to remove /api suffix to get host base
const HOST_BASE = BASE_URL.endsWith('/api') ? BASE_URL.slice(0, -4) : BASE_URL

export const PlaybackService = {
  async play(url: string) {
    try {
      if (sound) {
        await sound.unloadAsync()
      }

      console.log('[Playback] Starting:', url)
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: usePlayerStore.getState().volume },
        this.onPlaybackStatusUpdate.bind(this)
      )
      sound = newSound
    } catch (error) {
      console.error('Playback error:', error)
    }
  },

  async pause() {
    if (sound) {
      await sound.pauseAsync()
    }
  },

  async resume() {
    if (sound) {
      await sound.playAsync()
    }
  },

  async stop() {
    if (sound) {
      await sound.stopAsync()
      await sound.unloadAsync()
      sound = null
    }
  },

  async seek(progress: number) {
    if (sound) {
      const status = await sound.getStatusAsync()
      if (status.isLoaded) {
        await sound.setPositionAsync(progress * status.durationMillis!)
      }
    }
  },

  async setVolume(volume: number) {
    if (sound) {
      await sound.setVolumeAsync(volume)
    }
  },

  onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      usePlayerStore.setState({ 
        progress: status.positionMillis / status.durationMillis,
        isPlaying: status.isPlaying
      })

      if (status.didJustFinish) {
        usePlayerStore.getState().next()
      }
    }
  }
}

// Subscribe to store changes to control the sound object
usePlayerStore.subscribe(
  (state) => state.track,
  (track) => {
    if (track) {
      const url = track.audioUrl.startsWith('http') 
        ? track.audioUrl 
        : `${HOST_BASE}${track.audioUrl}`
      PlaybackService.play(url)
    } else {
      PlaybackService.stop()
    }
  }
)

usePlayerStore.subscribe(
  (state) => state.isPlaying,
  (isPlaying) => {
    if (isPlaying) PlaybackService.resume()
    else PlaybackService.pause()
  }
)

usePlayerStore.subscribe(
  (state) => state.volume,
  (volume) => PlaybackService.setVolume(volume)
)
