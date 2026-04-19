import { create } from 'zustand'

export interface MobileUser {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'user'
  plan: 'free' | 'premium'
}

interface AuthState {
  user: MobileUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const DEMO_ACCOUNTS: Record<string, MobileUser & { password: string }> = {
  'admin@localmusic.app': {
    id: 'admin-1', name: 'Super Admin', email: 'admin@localmusic.app',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin', plan: 'premium', password: 'admin123',
  },
  'user@localmusic.app': {
    id: 'user-1', name: 'Music Fan', email: 'user@localmusic.app',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    role: 'user', plan: 'free', password: 'user123',
  },
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    await new Promise(r => setTimeout(r, 600)) // simulate network

    const account = DEMO_ACCOUNTS[email.toLowerCase()]
    if (!account || account.password !== password) {
      set({ isLoading: false })
      return { success: false, error: 'Invalid email or password' }
    }

    const { password: _, ...user } = account
    set({ user, isLoading: false })
    return { success: true }
  },

  logout: () => set({ user: null }),
}))
