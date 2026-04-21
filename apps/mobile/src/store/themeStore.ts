import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const THEME_COLOR_KEY = 'lm-accent-color'

interface ThemeState {
  accentColor: string
  init: () => Promise<void>
  setAccentColor: (color: string) => Promise<void>
}

export const useThemeStore = create<ThemeState>((set) => ({
  accentColor: '#A855F7', // Default purple

  init: async () => {
    try {
      const color = await AsyncStorage.getItem(THEME_COLOR_KEY)
      if (color) {
        set({ accentColor: color })
      }
    } catch (e) {
      console.error('Failed to init theme store:', e)
    }
  },

  setAccentColor: async (color: string) => {
    set({ accentColor: color })
    try {
      await AsyncStorage.setItem(THEME_COLOR_KEY, color)
    } catch (e) {
      console.error('Failed to save theme color:', e)
    }
  },
}))
