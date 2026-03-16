import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Role = 'admin' | 'officer' | null

interface AuthState {
  role: Role
  name: string
  selectedWindowId: string | null
  isAuthenticated: boolean
  login: (role: NonNullable<Role>, name: string, windowId?: string) => void
  logout: () => void
  setSelectedWindow: (windowId: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      name: '',
      selectedWindowId: null,
      isAuthenticated: false,

      login: (role, name, windowId) =>
        set({
          role,
          name,
          selectedWindowId: windowId ?? null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          role: null,
          name: '',
          selectedWindowId: null,
          isAuthenticated: false,
        }),

      setSelectedWindow: (windowId) =>
        set({ selectedWindowId: windowId }),
    }),
    {
      name: 'eduqueue-auth',
    }
  )
)
