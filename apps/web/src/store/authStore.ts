import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  plan: 'free' | 'premium'
}

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initDemoUser: () => void
}

// Demo users
const DEMO_USERS: Record<string, User & { password: string }> = {
  'admin@localmusic.app': {
    id: 'admin-001',
    name: 'Super Admin',
    email: 'admin@localmusic.app',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    plan: 'premium',
    password: 'admin123',
  },
  'user@localmusic.app': {
    id: 'user-001',
    name: 'Sumit Kumar',
    email: 'user@localmusic.app',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sumit',
    role: 'user',
    plan: 'free',
    password: 'user123',
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        await new Promise(r => setTimeout(r, 800)) // simulate API

        const demo = DEMO_USERS[email.toLowerCase()]
        if (demo && demo.password === password) {
          const { password: _, ...user } = demo
          void _
          set({ user, isLoading: false })
        } else {
          set({ isLoading: false })
          throw new Error('Invalid credentials')
        }
      },

      logout: () => set({ user: null }),

      initDemoUser: () => {
        // Auto-login for demo — removes on real app
      },
    }),
    { name: 'local-music-auth' }
  )
)
