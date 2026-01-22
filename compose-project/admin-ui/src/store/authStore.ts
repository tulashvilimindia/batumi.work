import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  apiKey: string | null
  isAuthenticated: boolean
  setApiKey: (key: string) => void
  clearApiKey: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      apiKey: null,
      isAuthenticated: false,
      setApiKey: (key: string) => {
        localStorage.setItem('adminApiKey', key)
        set({ apiKey: key, isAuthenticated: true })
      },
      clearApiKey: () => {
        localStorage.removeItem('adminApiKey')
        set({ apiKey: null, isAuthenticated: false })
      },
    }),
    {
      name: 'admin-auth',
    }
  )
)
