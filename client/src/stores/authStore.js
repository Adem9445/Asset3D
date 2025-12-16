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
          const response = await axios.get(`${API_URL}/auth/me`)
          if (response.data?.csrfToken) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              csrfToken: response.data.csrfToken,
            })
          } else {
            set({
              user: response.data.user,
              isAuthenticated: true,
            })
          }
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

// Configure axios interceptors to automatically include auth headers
axios.interceptors.request.use((config) => {
  const state = useAuthStore.getState()

  if (state.token) {
    config.headers.Authorization = `Bearer ${state.token}`
  }

  if (state.csrfToken) {
    config.headers['X-CSRF-Token'] = state.csrfToken
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle 401 errors by logging out
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
