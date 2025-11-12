import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Asset Store - Håndterer all asset-relatert state og API-kall
 */
const useAssetStore = create((set, get) => ({
  // State
  assets: [],
  categories: [],
  selectedAsset: null,
  loading: false,
  error: null,
  filters: {
    categoryId: null,
    roomId: null,
    searchTerm: '',
    status: 'all'
  },
  stats: {
    totalAssets: 0,
    totalValue: 0,
    byCategory: {},
    byLocation: {},
    recentAssets: []
  },

  // Actions
  
  /**
   * Hent alle assets med filtrering
   */
  fetchAssets: async (roomId = null, categoryId = null) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (roomId) params.append('roomId', roomId)
      if (categoryId) params.append('categoryId', categoryId)
      
      const response = await axios.get(
        `${API_URL}/assets?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      const assets = response.data
      
      // Calculate stats
      const totalValue = assets.reduce((sum, asset) => 
        sum + (asset.purchase_price || 0), 0
      )
      
      const byCategory = assets.reduce((acc, asset) => {
        const category = asset.category_name || 'Ukategorisert'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
      
      const byLocation = assets.reduce((acc, asset) => {
        const location = asset.room_name || 'Ikke plassert'
        acc[location] = (acc[location] || 0) + 1
        return acc
      }, {})
      
      set({ 
        assets,
        stats: {
          totalAssets: assets.length,
          totalValue,
          byCategory,
          byLocation,
          recentAssets: assets.slice(0, 5)
        },
        loading: false 
      })
      
      return assets
    } catch (error) {
      console.error('Fetch assets error:', error)
      set({ 
        error: error.response?.data?.message || 'Kunne ikke hente assets',
        loading: false 
      })
      throw error
    }
  },

  /**
   * Hent asset kategorier
   */
  fetchCategories: async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/assets/categories`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      set({ categories: response.data })
      return response.data
    } catch (error) {
      console.error('Fetch categories error:', error)
      set({ error: error.response?.data?.message || 'Kunne ikke hente kategorier' })
      throw error
    }
  },

  /**
   * Hent enkelt asset
   */
  fetchAsset: async (id) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${API_URL}/assets/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      set({ selectedAsset: response.data, loading: false })
      return response.data
    } catch (error) {
      console.error('Fetch asset error:', error)
      set({ 
        error: error.response?.data?.message || 'Kunne ikke hente asset',
        loading: false 
      })
      throw error
    }
  },

  /**
   * Opprett ny asset
   */
  createAsset: async (assetData) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/assets`,
        assetData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      const newAsset = response.data
      set(state => ({ 
        assets: [newAsset, ...state.assets],
        loading: false,
        stats: {
          ...state.stats,
          totalAssets: state.stats.totalAssets + 1,
          totalValue: state.stats.totalValue + (newAsset.purchase_price || 0)
        }
      }))
      
      return newAsset
    } catch (error) {
      console.error('Create asset error:', error)
      set({ 
        error: error.response?.data?.message || 'Kunne ikke opprette asset',
        loading: false 
      })
      throw error
    }
  },

  /**
   * Oppdater asset
   */
  updateAsset: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.patch(
        `${API_URL}/assets/${id}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      const updatedAsset = response.data
      set(state => ({
        assets: state.assets.map(asset => 
          asset.id === id ? updatedAsset : asset
        ),
        selectedAsset: state.selectedAsset?.id === id 
          ? updatedAsset 
          : state.selectedAsset,
        loading: false
      }))
      
      return updatedAsset
    } catch (error) {
      console.error('Update asset error:', error)
      set({ 
        error: error.response?.data?.message || 'Kunne ikke oppdatere asset',
        loading: false 
      })
      throw error
    }
  },

  /**
   * Oppdater asset transform (posisjon, rotasjon, skala)
   */
  updateAssetTransform: async (id, transform) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.patch(
        `${API_URL}/assets/${id}/transform`,
        transform,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      const updatedAsset = response.data
      set(state => ({
        assets: state.assets.map(asset => 
          asset.id === id ? updatedAsset : asset
        )
      }))
      
      return updatedAsset
    } catch (error) {
      console.error('Update asset transform error:', error)
      throw error
    }
  },

  /**
   * Flytt asset til annet rom
   */
  moveAsset: async (id, roomId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.patch(
        `${API_URL}/assets/${id}/move`,
        { roomId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      const updatedAsset = response.data
      set(state => ({
        assets: state.assets.map(asset => 
          asset.id === id ? updatedAsset : asset
        ),
        loading: false
      }))
      
      return updatedAsset
    } catch (error) {
      console.error('Move asset error:', error)
      set({ 
        error: error.response?.data?.message || 'Kunne ikke flytte asset',
        loading: false 
      })
      throw error
    }
  },

  /**
   * Slett asset
   */
  deleteAsset: async (id) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      await axios.delete(
        `${API_URL}/assets/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      set(state => ({
        assets: state.assets.filter(asset => asset.id !== id),
        selectedAsset: state.selectedAsset?.id === id ? null : state.selectedAsset,
        loading: false,
        stats: {
          ...state.stats,
          totalAssets: state.stats.totalAssets - 1
        }
      }))
    } catch (error) {
      console.error('Delete asset error:', error)
      set({ 
        error: error.response?.data?.message || 'Kunne ikke slette asset',
        loading: false 
      })
      throw error
    }
  },

  /**
   * Bulk operations
   */
  bulkUpdateAssets: async (assetIds, updates) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const promises = assetIds.map(id => 
        axios.patch(
          `${API_URL}/assets/${id}`,
          updates,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      )
      
      const responses = await Promise.all(promises)
      const updatedAssets = responses.map(r => r.data)
      
      set(state => ({
        assets: state.assets.map(asset => {
          const updated = updatedAssets.find(u => u.id === asset.id)
          return updated || asset
        }),
        loading: false
      }))
      
      return updatedAssets
    } catch (error) {
      console.error('Bulk update error:', error)
      set({ 
        error: 'Kunne ikke oppdatere flere assets',
        loading: false 
      })
      throw error
    }
  },

  bulkDeleteAssets: async (assetIds) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const promises = assetIds.map(id => 
        axios.delete(
          `${API_URL}/assets/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      )
      
      await Promise.all(promises)
      
      set(state => ({
        assets: state.assets.filter(asset => !assetIds.includes(asset.id)),
        loading: false,
        stats: {
          ...state.stats,
          totalAssets: state.stats.totalAssets - assetIds.length
        }
      }))
    } catch (error) {
      console.error('Bulk delete error:', error)
      set({ 
        error: 'Kunne ikke slette flere assets',
        loading: false 
      })
      throw error
    }
  },

  /**
   * Set filters
   */
  setFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  /**
   * Clear filters
   */
  clearFilters: () => {
    set({
      filters: {
        categoryId: null,
        roomId: null,
        searchTerm: '',
        status: 'all'
      }
    })
  },

  /**
   * Set selected asset
   */
  setSelectedAsset: (asset) => {
    set({ selectedAsset: asset })
  },

  /**
   * Clear selected asset
   */
  clearSelectedAsset: () => {
    set({ selectedAsset: null })
  },

  /**
   * Get filtered assets
   */
  getFilteredAssets: () => {
    const state = get()
    let filtered = [...state.assets]
    
    // Filter by category
    if (state.filters.categoryId) {
      filtered = filtered.filter(a => a.category_id === state.filters.categoryId)
    }
    
    // Filter by room
    if (state.filters.roomId) {
      filtered = filtered.filter(a => a.room_id === state.filters.roomId)
    }
    
    // Filter by search term
    if (state.filters.searchTerm) {
      const term = state.filters.searchTerm.toLowerCase()
      filtered = filtered.filter(a => 
        a.name?.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term) ||
        a.asset_type?.toLowerCase().includes(term)
      )
    }
    
    // Filter by status
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === state.filters.status)
    }
    
    return filtered
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      assets: [],
      categories: [],
      selectedAsset: null,
      loading: false,
      error: null,
      filters: {
        categoryId: null,
        roomId: null,
        searchTerm: '',
        status: 'all'
      },
      stats: {
        totalAssets: 0,
        totalValue: 0,
        byCategory: {},
        byLocation: {},
        recentAssets: []
      }
    })
  }
}))

export default useAssetStore
