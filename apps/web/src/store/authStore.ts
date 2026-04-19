import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../lib/api'
import { User, Role, BillingTier } from '@local-music/shared/src/types/user'

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
  const role = (apiUser.role || 'USER').toUpperCase() as Role
  const billingTier = (apiUser.billingTier || 'FREE').toUpperCase() as BillingTier
  
  return {
    id: apiUser.id,
    name: apiUser.profile?.displayName || apiUser.username || 'User',
    displayName: apiUser.profile?.displayName,
    username: apiUser.username,
    email: apiUser.email,
    avatar: apiUser.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiUser.username || 'default'}`,
    avatarUrl: apiUser.profile?.avatarUrl,
    role,
    billingTier,
    plan: billingTier,
    createdAt: apiUser.createdAt || new Date().toISOString(),
    updatedAt: apiUser.updatedAt || new Date().toISOString(),
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
