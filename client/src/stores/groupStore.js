import { create } from 'zustand'
import axios from 'axios'

const API_URL = '/api'

/**
 * Group Store - Manages group and company relationships
 */
const useGroupStore = create((set, get) => ({
  // State
  groups: [],
  selectedGroup: null,
  companies: [],
  loading: false,
  error: null,
  stats: {
    totalGroups: 0,
    totalCompanies: 0,
    totalEmployees: 0,
    totalAssets: 0,
    totalValue: 0
  },

  // Actions

  /**
   * Fetch all groups
   */
  fetchGroups: async (token) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const groups = Array.isArray(response.data.groups) ? response.data.groups : (Array.isArray(response.data) ? response.data : [])

      // Calculate stats
      const totalCompanies = groups.reduce((sum, g) => sum + (g.companies_count || 0), 0)
      const totalEmployees = groups.reduce((sum, g) => sum + (g.total_employees || 0), 0)
      const totalAssets = groups.reduce((sum, g) => sum + (g.total_assets || 0), 0)
      const totalValue = groups.reduce((sum, g) => sum + (g.total_value || 0), 0)

      set({
        groups,
        stats: {
          totalGroups: groups.length,
          totalCompanies,
          totalEmployees,
          totalAssets,
          totalValue
        },
        loading: false
      })

      return groups
    } catch (error) {
      console.error('Fetch groups error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke hente grupper',
        loading: false
      })
      throw error
    }
  },

  /**
   * Fetch single group with details
   */
  fetchGroup: async (groupId, token) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      set({
        selectedGroup: response.data,
        companies: response.data.companies || [],
        loading: false
      })

      return response.data
    } catch (error) {
      console.error('Fetch group error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke hente gruppe',
        loading: false
      })
      throw error
    }
  },

  /**
   * Create new group
   */
  createGroup: async (groupData, token) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(
        `${API_URL}/groups`,
        groupData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const newGroup = response.data
      set(state => ({
        groups: [...state.groups, newGroup],
        loading: false
      }))

      return newGroup
    } catch (error) {
      console.error('Create group error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke opprette gruppe',
        loading: false
      })
      throw error
    }
  },

  /**
   * Update group
   */
  updateGroup: async (groupId, updates, token) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.put(
        `${API_URL}/groups/${groupId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const updatedGroup = response.data
      set(state => ({
        groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
        selectedGroup: state.selectedGroup?.id === groupId ? updatedGroup : state.selectedGroup,
        loading: false
      }))

      return updatedGroup
    } catch (error) {
      console.error('Update group error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke oppdatere gruppe',
        loading: false
      })
      throw error
    }
  },

  /**
   * Delete group
   */
  deleteGroup: async (groupId, token) => {
    set({ loading: true, error: null })
    try {
      await axios.delete(`${API_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      set(state => ({
        groups: state.groups.filter(g => g.id !== groupId),
        selectedGroup: state.selectedGroup?.id === groupId ? null : state.selectedGroup,
        loading: false
      }))
    } catch (error) {
      console.error('Delete group error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke slette gruppe',
        loading: false
      })
      throw error
    }
  },

  /**
   * Add company to group
   */
  addCompanyToGroup: async (groupId, companyId, token) => {
    set({ loading: true, error: null })
    try {
      await axios.post(
        `${API_URL}/groups/${groupId}/companies`,
        { companyId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Refresh group data
      await get().fetchGroup(groupId, token)
      set({ loading: false })
    } catch (error) {
      console.error('Add company error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke legge til selskap',
        loading: false
      })
      throw error
    }
  },

  /**
   * Remove company from group
   */
  removeCompanyFromGroup: async (groupId, companyId, token) => {
    set({ loading: true, error: null })
    try {
      await axios.delete(
        `${API_URL}/groups/${groupId}/companies/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      set(state => ({
        companies: state.companies.filter(c => c.id !== companyId),
        loading: false
      }))
    } catch (error) {
      console.error('Remove company error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke fjerne selskap',
        loading: false
      })
      throw error
    }
  },

  /**
   * Send invitation to company
   */
  sendInvitation: async (groupId, inviteData, token) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(
        `${API_URL}/groups/${groupId}/invitations`,
        inviteData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      set({ loading: false })
      return response.data
    } catch (error) {
      console.error('Send invitation error:', error)
      set({
        error: error.response?.data?.message || 'Kunne ikke sende invitasjon',
        loading: false
      })
      throw error
    }
  },

  /**
   * Get group statistics
   */
  fetchGroupStats: async (groupId, token) => {
    try {
      const response = await axios.get(
        `${API_URL}/groups/${groupId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      return response.data
    } catch (error) {
      console.error('Fetch stats error:', error)
      throw error
    }
  },

  /**
   * Set selected group
   */
  setSelectedGroup: (group) => {
    set({ selectedGroup: group })
  },

  /**
   * Clear selected group
   */
  clearSelectedGroup: () => {
    set({ selectedGroup: null, companies: [] })
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      groups: [],
      selectedGroup: null,
      companies: [],
      loading: false,
      error: null,
      stats: {
        totalGroups: 0,
        totalCompanies: 0,
        totalEmployees: 0,
        totalAssets: 0,
        totalValue: 0
      }
    })
  }
}))

export default useGroupStore
