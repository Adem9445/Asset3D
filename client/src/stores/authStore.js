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
      csrfToken: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
          })
          
          const { user, token, csrfToken } = response.data

          // Sett token i axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          if (csrfToken) {
            axios.defaults.headers.common['X-CSRF-Token'] = csrfToken
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            csrfToken: csrfToken || null,
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
        delete axios.defaults.headers.common['X-CSRF-Token']
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          csrfToken: null,
        })
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      checkAuth: async () => {
        const { token, csrfToken } = get()
        if (!token) {
          set({ isAuthenticated: false })
          return
        }

        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          if (csrfToken) {
            axios.defaults.headers.common['X-CSRF-Token'] = csrfToken
          }
          const response = await axios.get(`${API_URL}/auth/me`)
          if (response.data?.csrfToken) {
            axios.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken
          }
          set({
            user: response.data.user,
            isAuthenticated: true,
            csrfToken: response.data?.csrfToken || get().csrfToken,
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
        csrfToken: state.csrfToken,
      }),
    }
  )
)
