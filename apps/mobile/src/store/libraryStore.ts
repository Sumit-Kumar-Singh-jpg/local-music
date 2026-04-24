import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LIKED_TRACKS_KEY = 'lm-liked-tracks'

interface LibraryState {
  likedTrackIds: Set<string>
  init: () => Promise<void>
  toggleLike: (trackId: string) => Promise<void>
  isLiked: (trackId: string) => boolean
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedTrackIds: new Set(),

  init: async () => {
    try {
      const data = await AsyncStorage.getItem(LIKED_TRACKS_KEY)
      if (data) {
        set({ likedTrackIds: new Set(JSON.parse(data)) })
      }
    } catch (e) {
      console.error('Failed to load liked tracks:', e)
    }
  },

  toggleLike: async (trackId: string) => {
    set((state) => {
      const next = new Set(state.likedTrackIds)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      
      // Persist
      AsyncStorage.setItem(LIKED_TRACKS_KEY, JSON.stringify(Array.from(next))).catch(console.error)
      return { likedTrackIds: next }
    })
  },

  isLiked: (trackId: string) => {
    return get().likedTrackIds.has(trackId)
  }
}))
