import { create } from 'zustand'
import axios from 'axios'

const API_URL = '/api'

const useBuildingStore = create((set, get) => ({
  buildings: [],
  selectedBuildingId: null,
  loading: false,
  error: null,

  fetchBuildings: async () => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const buildings = response.data || []
      const currentSelection = get().selectedBuildingId
      const nextSelection = currentSelection && buildings.some(b => b.id === currentSelection)
        ? currentSelection
        : buildings[0]?.id || null

      set({
        buildings,
        selectedBuildingId: nextSelection,
        loading: false
      })

      return buildings
    } catch (error) {
      console.error('Fetch buildings error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke hente bygninger',
        loading: false
      })
      throw error
    }
  },

  fetchBuilding: async (id) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const building = response.data
      set(state => ({
        buildings: state.buildings.some(b => b.id === building.id)
          ? state.buildings.map(b => (b.id === building.id ? building : b))
          : [...state.buildings, building],
        selectedBuildingId: building.id,
        loading: false
      }))

      return building
    } catch (error) {
      console.error('Fetch building error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke hente bygning',
        loading: false
      })
      throw error
    }
  },

  selectBuilding: (id) => {
    set({ selectedBuildingId: id })
  }
}))

export default useBuildingStore
