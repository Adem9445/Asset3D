/**
 * Storage Service for ASSET3D
 * Sentraliserer lokal lagring, versjonshåndtering og server-synkronisering
 */

import axios from 'axios'

const API_URL = '/api'

class StorageService {
  constructor() {
    this.storageKey = 'asset3d_data'
    this.autoSaveInterval = null
    this.pendingChanges = false
    this.lastSaved = null
    this.saveCallbacks = new Set()
    this.maxVersions = 10
    this.keyboardShortcuts = new Map()
    this.beforeUnloadHandler = null

    this.handleKeydown = this.handleKeydown.bind(this)
    this.initializeKeyboardShortcuts()
  }

  /**
   * Keyboard shortcut handling
   */
  initializeKeyboardShortcuts() {
    if (typeof document === 'undefined') return
    document.addEventListener('keydown', this.handleKeydown)
  }

  handleKeydown(event) {
    const key = this.getKeyCombo(event)
    const handler = this.keyboardShortcuts.get(key)
    if (handler) {
      event.preventDefault()
      handler(event)
    }
  }

  getKeyCombo(event) {
    const parts = []
    if (event.ctrlKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    if (event.metaKey) parts.push('cmd')
    if (event.key) parts.push(event.key.toLowerCase())
    return parts.join('+')
  }

  registerShortcut(combo, handler) {
    if (!combo || typeof handler !== 'function') return () => {}
    const normalized = combo.toLowerCase()
    this.keyboardShortcuts.set(normalized, handler)
    return () => this.keyboardShortcuts.delete(normalized)
  }

  /**
   * Save callback handling
   */
  onSave(callback) {
    if (!callback) return () => {}
    this.saveCallbacks.add(callback)
    return () => this.saveCallbacks.delete(callback)
  }

  notifySave(key, timestamp) {
    this.saveCallbacks.forEach(callback => callback({ key, timestamp }))
  }

  /**
   * Helpers for storage keys & parsing
   */
  storageKeyFor(key) {
    return `${this.storageKey}_${key}`
  }

  versionKeyFor(key) {
    return `${this.storageKey}_version_${key}`
  }

  parseJSON(value, fallback = null) {
    try {
      return JSON.parse(value)
    } catch (error) {
      return fallback
    }
  }

  /**
   * Local storage helpers
   */
  saveLocal(key, data, { createVersion = true } = {}) {
    try {
      const timestamp = new Date().toISOString()
      const payload = { data, timestamp, version: '1.0.0' }

      if (createVersion) {
        this.createVersion(key, data, timestamp)
      }

      localStorage.setItem(this.storageKeyFor(key), JSON.stringify(payload))
      this.lastSaved = timestamp
      this.notifySave(key, timestamp)
      return true
    } catch (error) {
      console.error('Feil ved lokal lagring:', error)
      return false
    }
  }

  loadLocal(key) {
    try {
      const saved = localStorage.getItem(this.storageKeyFor(key))
      if (!saved) return null
      const parsed = this.parseJSON(saved)
      return parsed?.data ?? null
    } catch (error) {
      console.error('Feil ved lokal lasting:', error)
      return null
    }
  }

  createVersion(key, data, timestamp) {
    const versionKey = this.versionKeyFor(key)
    const versions = this.parseJSON(localStorage.getItem(versionKey), [])
    const serialized = JSON.stringify(data)

    versions.unshift({
      timestamp,
      data: serialized,
      size: serialized.length
    })

    if (versions.length > this.maxVersions) {
      versions.length = this.maxVersions
    }

    try {
      localStorage.setItem(versionKey, JSON.stringify(versions))
    } catch (error) {
      console.error('Error saving version:', error)
    }
  }

  getVersionHistory(key) {
    const versions = this.parseJSON(localStorage.getItem(this.versionKeyFor(key)), [])
    return versions.map(v => ({ ...v, data: this.parseJSON(v.data) }))
  }

  restoreVersion(key, timestamp) {
    const version = this.getVersionHistory(key).find(v => v.timestamp === timestamp)

    if (!version) {
      console.error('Version not found:', timestamp)
      return null
    }

    this.saveLocal(key, version.data, { createVersion: false })
    return version.data
  }

  /**
   * Server communication helpers
   */
  async saveToServer(endpoint, data, token) {
    try {
      const response = await axios.post(
        `${API_URL}/${endpoint}`,
        data,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Feil ved server-lagring:', error)
      this.saveLocal(`server_fallback_${endpoint}`, data)
      throw error
    }
  }

  async loadFromServer(endpoint, token) {
    try {
      const response = await axios.get(
        `${API_URL}/${endpoint}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Feil ved server-lasting:', error)
      const fallback = this.loadLocal(`server_fallback_${endpoint}`)
      if (fallback) {
        console.log('📦 Bruker lokal fallback data')
        return fallback
      }
      throw error
    }
  }

  /**
   * Auto-save handling
   */
  enableAutoSave(saveFunction, interval = 30000) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }

    this.autoSaveInterval = setInterval(() => {
      if (this.pendingChanges) {
        saveFunction?.()
        this.pendingChanges = false
      }
    }, interval)

    if (!this.beforeUnloadHandler) {
      this.beforeUnloadHandler = (e) => {
        if (this.pendingChanges) {
          saveFunction?.()
          e.preventDefault()
          e.returnValue = 'Du har ulagrede endringer. Er du sikker på at du vil forlate siden?'
        }
      }
      window.addEventListener('beforeunload', this.beforeUnloadHandler)
    }
  }

  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
      this.beforeUnloadHandler = null
    }
  }

  markAsChanged() {
    this.pendingChanges = true
  }

  hasUnsavedChanges() {
    return this.pendingChanges
  }

  /**
   * Data import/export helpers
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
   * Domain-specific helpers
   */
  async saveBuilding(building, token) {
    try {
      const key = 'current_building'
      this.saveLocal(key, building)

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

  async loadBuilding(buildingId, token) {
    if (token && buildingId) {
      try {
        const serverData = await this.loadFromServer(`buildings/${buildingId}`, token)
        if (serverData) return serverData
      } catch (error) {
        console.warn('Kunne ikke laste fra server')
      }
    }

    return this.loadLocal('current_building')
  }

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

  loadRoom(roomId) {
    const rooms = this.loadLocal('rooms') || {}
    return rooms[roomId] || null
  }

  saveAssets(assets) {
    this.saveLocal('assets', assets)
    this.markAsChanged()
    return true
  }

  loadAssets() {
    return this.loadLocal('assets') || []
  }

  clearLocalData() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.storageKey)) {
        localStorage.removeItem(key)
      }
    })
    console.log('🗑️ All lokal data slettet')
  }

  getStorageInfo() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.storageKey))
    const items = keys.map(key => {
      const value = localStorage.getItem(key) || ''
      return {
        key: key.replace(`${this.storageKey}_`, ''),
        size: (value.length / 1024).toFixed(2) + ' KB'
      }
    })

    const totalSize = items.reduce((sum, item) => {
      const size = parseFloat(item.size)
      return sum + (Number.isNaN(size) ? 0 : size)
    }, 0)

    return {
      itemCount: items.length,
      totalSize: totalSize.toFixed(2) + ' KB',
      lastSaved: this.lastSaved,
      hasUnsavedChanges: this.pendingChanges,
      items
    }
  }
}

// Singleton instance
const storageService = new StorageService()

export default storageService
