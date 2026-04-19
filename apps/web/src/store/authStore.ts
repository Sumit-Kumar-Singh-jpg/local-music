import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../lib/api'

export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  role: string
  billingTier: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, username: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

function mapApiUser(apiUser: any): User {
  return {
    id: apiUser.id,
    name: apiUser.profile?.displayName || apiUser.username || 'User',
    username: apiUser.username,
    email: apiUser.email,
    avatar: apiUser.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.username || 'default'}`,
    role: (apiUser.role || 'USER').toLowerCase(),
    billingTier: (apiUser.billingTier || 'FREE').toLowerCase(),
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (identifier: string, password: string) => {
        set({ isLoading: true })
        try {
          const data = await authApi.login(identifier, password)
          set({ 
            user: mapApiUser(data.user),
            token: data.token,
            isLoading: false 
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (name: string, email: string, password: string, username: string) => {
        set({ isLoading: true })
        try {
          const data = await authApi.register(name, email, password, username)
          set({
            user: mapApiUser(data.user),
            token: data.token,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ user: null, token: null })
      },

      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
    }),
    { name: 'local-music-auth' }
  )
)
