import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = '/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          })
          
          const { user, token } = response.data
          
          // Sett token i axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return { success: true }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Innlogging feilet',
            isLoading: false,
          })
          return { success: false, error: error.response?.data?.message }
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      checkAuth: async () => {
        const token = get().token
        if (!token) {
          set({ isAuthenticated: false })
          return
        }

        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await axios.get(`${API_URL}/auth/me`)
          set({
            user: response.data.user,
            isAuthenticated: true,
          })
        } catch (error) {
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
