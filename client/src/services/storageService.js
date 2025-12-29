/**
 * Storage Service for ASSET3D
 * Håndterer all lagring og lasting av data
 */

import axios from 'axios'

const API_URL = '/api'

class StorageService {
  constructor() {
    this.storageKey = 'asset3d_data'
    this.autoSaveInterval = null
    this.pendingChanges = false
    this.lastSaved = null
    this.saveCallbacks = []
    this.versionHistory = []
    this.maxVersions = 10
    this.keyboardShortcuts = new Map()

    // Initialize keyboard shortcuts
    this.initializeKeyboardShortcuts()
  }

  /**
   * Initialize keyboard shortcut handling
   */
  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyCombo(e)
      const handler = this.keyboardShortcuts.get(key)
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    })
  }

  /**
   * Get keyboard combo string
   */
  getKeyCombo(event) {
    const parts = []
    if (event.ctrlKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    if (event.metaKey) parts.push('cmd')
    if (event.key) {
      parts.push(event.key.toLowerCase())
    }
    return parts.join('+')
  }

  /**
   * Register keyboard shortcut
   */
  registerShortcut(combo, handler) {
    this.keyboardShortcuts.set(combo.toLowerCase(), handler)
  }

  /**
   * Register save callback
   */
  onSave(callback) {
    this.saveCallbacks.push(callback)
    return () => {
      this.saveCallbacks = this.saveCallbacks.filter(cb => cb !== callback)
    }
  }

  /**
   * Lagre data lokalt (localStorage) with versioning
   */
  saveLocal(key, data, createVersion = true) {
    try {
      const timestamp = new Date().toISOString()
      const saveData = {
        data,
        timestamp,
        version: '1.0.0'
      }

      // Create version if enabled
      if (createVersion) {
        this.createVersion(key, data, timestamp)
      }

      localStorage.setItem(`${this.storageKey}_${key}`, JSON.stringify(saveData))
      this.lastSaved = timestamp
      console.log(`✅ Data lagret lokalt: ${key}`)

      // Notify save callbacks
      this.saveCallbacks.forEach(callback => callback({ key, timestamp }))

      return true
    } catch (error) {
      console.error('Feil ved lokal lagring:', error)
      return false
    }
  }

  /**
   * Create a version entry
   */
  createVersion(key, data, timestamp) {
    const versionKey = `${this.storageKey}_version_${key}`
    let versions = []

    try {
      const existing = localStorage.getItem(versionKey)
      if (existing) {
        versions = JSON.parse(existing)
      }
    } catch (error) {
      console.error('Error loading versions:', error)
    }

    // Add new version
    versions.unshift({
      timestamp,
      data: JSON.stringify(data),
      size: JSON.stringify(data).length
    })

    // Keep only max versions
    if (versions.length > this.maxVersions) {
      versions = versions.slice(0, this.maxVersions)
    }

    try {
      localStorage.setItem(versionKey, JSON.stringify(versions))
    } catch (error) {
      console.error('Error saving version:', error)
    }
  }

  /**
   * Get version history
   */
  getVersionHistory(key) {
    const versionKey = `${this.storageKey}_version_${key}`
    try {
      const versions = localStorage.getItem(versionKey)
      if (versions) {
        return JSON.parse(versions).map(v => ({
          ...v,
          data: JSON.parse(v.data)
        }))
      }
    } catch (error) {
      console.error('Error loading version history:', error)
    }
    return []
  }

  /**
   * Restore from version
   */
  restoreVersion(key, timestamp) {
    const versions = this.getVersionHistory(key)
    const version = versions.find(v => v.timestamp === timestamp)

    if (version) {
      this.saveLocal(key, version.data, false) // Don't create new version when restoring
      console.log(`♻️ Restored version from ${timestamp}`)
      return version.data
    }

    console.error('Version not found:', timestamp)
    return null
  }

  /**
   * Last data lokalt
   */
  loadLocal(key) {
    try {
      const saved = localStorage.getItem(`${this.storageKey}_${key}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log(`✅ Data lastet lokalt: ${key}`)
        return parsed.data
      }
      return null
    } catch (error) {
      console.error('Feil ved lokal lasting:', error)
      return null
    }
  }

  /**
   * Lagre til server
   */
  async saveToServer(endpoint, data, token) {
    try {
      const response = await axios.post(
        `${API_URL}/${endpoint}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      console.log(`✅ Data lagret til server: ${endpoint}`)
      return response.data
    } catch (error) {
      console.error('Feil ved server-lagring:', error)
      // Fallback til lokal lagring
      this.saveLocal(`server_fallback_${endpoint}`, data)
      throw error
    }
  }

  /**
   * Last fra server
   */
  async loadFromServer(endpoint, token) {
    try {
      const response = await axios.get(
        `${API_URL}/${endpoint}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      console.log(`✅ Data lastet fra server: ${endpoint}`)
      return response.data
    } catch (error) {
      console.error('Feil ved server-lasting:', error)
      // Prøv lokal fallback
      const fallback = this.loadLocal(`server_fallback_${endpoint}`)
      if (fallback) {
        console.log('📦 Bruker lokal fallback data')
        return fallback
      }
      throw error
    }
  }

  /**
   * Auto-save funksjonalitet
   */
  enableAutoSave(saveFunction, interval = 30000) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }

    this.autoSaveInterval = setInterval(() => {
      if (this.pendingChanges) {
        saveFunction()
        this.pendingChanges = false
        console.log('💾 Auto-lagring utført')
      }
    }, interval)

    // Lagre ved window unload
    window.addEventListener('beforeunload', (e) => {
      if (this.pendingChanges) {
        saveFunction()
        e.preventDefault()
        e.returnValue = 'Du har ulagrede endringer. Er du sikker på at du vil forlate siden?'
      }
    })
  }

  /**
   * Marker at det er endringer som må lagres
   */
  markAsChanged() {
    this.pendingChanges = true
  }

  /**
   * Sjekk om det er ulagrede endringer
   */
  hasUnsavedChanges() {
    return this.pendingChanges
  }

  /**
   * Eksporter data
   */
  exportData(data, filename = 'asset3d_export') {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    console.log(`📥 Data eksportert: ${filename}`)
  }

  /**
   * Importer data
   */
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          console.log(`📤 Data importert fra fil: ${file.name}`)
          resolve(data)
        } catch (error) {
          console.error('Feil ved import:', error)
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  /**
   * Lagre byggning komplett
   */
  async saveBuilding(building, token) {
    try {
      console.log('Saving building with floors:', building.floors?.length, 'rooms:', building.rooms?.length)

      // Log asset distribution across floors
      building.floors?.forEach(floor => {
        const floorAssets = floor.rooms?.reduce((sum, roomRef) => {
          const room = building.rooms.find(r => r.id === roomRef.id)
          return sum + (room?.assets?.length || 0)
        }, 0) || 0
        console.log(`Floor "${floor.name}": ${floor.rooms?.length || 0} rooms, ${floorAssets} assets`)
      })

      // const timestamp = Date.now()
      // const key = `building_${building.id}_v${timestamp}`
      const mainKey = `current_building`

      // Lagre lokalt først
      this.saveLocal(mainKey, building)

      // Deretter prøv server
      if (token) {
        try {
          await this.saveToServer('buildings/save', building, token)
        } catch (error) {
          console.warn('Kunne ikke lagre til server, bruker lokal lagring')
        }
      }

      this.pendingChanges = false
      return true
    } catch (error) {
      console.error('Feil ved lagring av bygning:', error)
      throw error
    }
  }

  /**
   * Last byggning
   */
  async loadBuilding(buildingId, token) {
    // Prøv server først
    if (token && buildingId) {
      try {
        const serverData = await this.loadFromServer(`buildings/${buildingId}`, token)
        if (serverData) return serverData
      } catch (error) {
        console.warn('Kunne ikke laste fra server')
      }
    }

    // Fallback til lokal
    return this.loadLocal('current_building')
  }

  /**
   * Lagre rom
   */
  saveRoom(roomData) {
    const rooms = this.loadLocal('rooms') || {}
    rooms[roomData.id] = {
      ...roomData,
      lastModified: new Date().toISOString()
    }
    this.saveLocal('rooms', rooms)
    this.markAsChanged()
    return true
  }

  /**
   * Last rom
   */
  loadRoom(roomId) {
    const rooms = this.loadLocal('rooms') || {}
    return rooms[roomId] || null
  }

  /**
   * Lagre assets
   */
  saveAssets(assets) {
    this.saveLocal('assets', assets)
    this.markAsChanged()
    return true
  }

  /**
   * Last assets
   */
  loadAssets() {
    return this.loadLocal('assets') || []
  }

  /**
   * Slett all lokal data
   */
  clearLocalData() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.storageKey)) {
        localStorage.removeItem(key)
      }
    })
    console.log('🗑️ All lokal data slettet')
  }

  /**
   * Få lagringsstatus
   */
  getStorageInfo() {
    const keys = Object.keys(localStorage)
    const relevantKeys = keys.filter(k => k.startsWith(this.storageKey))
    const totalSize = relevantKeys.reduce((sum, key) => {
      return sum + localStorage.getItem(key).length
    }, 0)

    return {
      itemCount: relevantKeys.length,
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      lastSaved: this.lastSaved,
      hasUnsavedChanges: this.pendingChanges,
      items: relevantKeys.map(key => ({
        key: key.replace(this.storageKey + '_', ''),
        size: (localStorage.getItem(key).length / 1024).toFixed(2) + ' KB'
      }))
    }
  }
}

// Singleton instance
const storageService = new StorageService()

export default storageService
