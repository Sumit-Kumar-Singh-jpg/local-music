import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi, setAuthToken } from '../lib/api'
import { User } from '@local-music/shared/src/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const data = await authApi.login(email, password)
          setAuthToken(data.token)
          set({ 
            user: data.user, 
            token: data.token,
            isLoading: false 
          })
          return { success: true }
        } catch (error: any) {
          set({ isLoading: false })
          return { success: false, error: error.message || 'Login failed' }
        }
      },

      register: async (name, email, password, username) => {
        set({ isLoading: true })
        try {
          const data = await authApi.register(name, email, password, username)
          setAuthToken(data.token)
          set({
            user: data.user,
            token: data.token,
            isLoading: false
          })
          return { success: true }
        } catch (error: any) {
          set({ isLoading: false })
          return { success: false, error: error.message || 'Registration failed' }
        }
      },

      logout: () => {
        setAuthToken(null)
        set({ user: null, token: null })
        AsyncStorage.removeItem('local-music-auth')
      },

      updateUser: (updates) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      }
    }),
    {
      name: 'local-music-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token)
        }
      }
    }
  )
)
