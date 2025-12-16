import { useState, useEffect } from 'react'
import { X, History, Clock, Database, RotateCcw, FileText, CheckCircle } from 'lucide-react'
import storageService from '../services/storageService'

/**
 * VersionHistoryModal - Viser versjonshistorikk for lagrede data
 * Lar brukere se og gjenopprette tidligere versjoner
 */
const VersionHistoryModal = ({ isOpen, onClose, dataKey = 'current_building' }) => {
  const [versions, setVersions] = useState([])
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreSuccess, setRestoreSuccess] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      loadVersions()
    }
  }, [isOpen, dataKey])
  
  const loadVersions = () => {
    const history = storageService.getVersionHistory(dataKey)
    setVersions(history)
    if (history.length > 0) {
      setSelectedVersion(history[0])
      setPreviewData(history[0].data)
    }
  }
  
  const handleRestore = async () => {
    if (!selectedVersion) return
    
    setIsRestoring(true)
    try {
      const restored = storageService.restoreVersion(dataKey, selectedVersion.timestamp)
      if (restored) {
        setRestoreSuccess(true)
        setTimeout(() => {
          onClose()
          window.location.reload() // Refresh to load restored data
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert('Kunne ikke gjenopprette versjon')
    } finally {
      setIsRestoring(false)
    }
  }
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  const getTimeDiff = (timestamp) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diff = now - then
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} ${days === 1 ? 'dag' : 'dager'} siden`
    if (hours > 0) return `${hours} ${hours === 1 ? 'time' : 'timer'} siden`
    if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minutt' : 'minutter'} siden`
    return 'Nettopp'
  }
  
  if (!isOpen) return null
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-history-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="text-blue-600" size={24} />
            <div>
              <h2 id="version-history-title" className="text-xl font-bold">Versjonshistorikk</h2>
              <p className="text-sm text-gray-500">
                {versions.length} {versions.length === 1 ? 'versjon' : 'versjoner'} tilgjengelig
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Lukk"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Version List */}
          <div className="w-80 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Velg versjon</h3>
              <div className="space-y-2">
                {versions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Database size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>Ingen versjoner tilgjengelig</p>
                  </div>
                ) : (
                  versions.map((version, index) => (
                    <button
                      key={version.timestamp}
                      onClick={() => {
                        setSelectedVersion(version)
                        setPreviewData(version.data)
                      }}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all
                        ${selectedVersion?.timestamp === version.timestamp
                          ? 'bg-blue-50 border-2 border-blue-400'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-500 mt-0.5" />
                          <span className="text-sm font-medium">
                            {index === 0 ? 'Siste versjon' : `Versjon ${versions.length - index}`}
                          </span>
                        </div>
                        {index === 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Nyeste
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-6">
                        {formatTimestamp(version.timestamp)}
                      </div>
                      <div className="text-xs text-gray-400 ml-6">
                        {getTimeDiff(version.timestamp)} • {formatSize(version.size)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Forhåndsvisning</h3>
              {selectedVersion && previewData ? (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Grunnleggende informasjon</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bygning:</span>
                        <span className="font-medium">{previewData.name || 'Ukjent'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adresse:</span>
                        <span className="font-medium">{previewData.address || 'Ukjent'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Antall rom:</span>
                        <span className="font-medium">{previewData.rooms?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lagret:</span>
                        <span className="font-medium">{formatTimestamp(selectedVersion.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rooms */}
                  {previewData.rooms && previewData.rooms.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Rom ({previewData.rooms.length})</h4>
                      <div className="space-y-2">
                        {previewData.rooms.slice(0, 5).map((room, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{room.name || `Rom ${index + 1}`}</span>
                            <span className="text-gray-500">
                              {room.assets?.length || 0} assets
                            </span>
                          </div>
                        ))}
                        {previewData.rooms.length > 5 && (
                          <div className="text-sm text-gray-500 italic">
                            +{previewData.rooms.length - 5} flere rom...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Raw Data Preview */}
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="font-medium cursor-pointer hover:text-blue-600">
                      Tekniske detaljer (JSON)
                    </summary>
                    <pre className="mt-3 text-xs bg-white p-3 rounded border overflow-x-auto">
                      {JSON.stringify(previewData, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16">
                  <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>Velg en versjon for å se forhåndsvisning</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {selectedVersion && (
              <span>
                Valgt: {getTimeDiff(selectedVersion.timestamp)} • 
                Størrelse: {formatSize(selectedVersion.size)}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Avbryt
            </button>
            <button
              onClick={handleRestore}
              disabled={!selectedVersion || isRestoring || restoreSuccess}
              className={`
                px-4 py-2 rounded-lg transition-all flex items-center gap-2
                ${restoreSuccess
                  ? 'bg-green-600 text-white'
                  : selectedVersion && !isRestoring
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {restoreSuccess ? (
                <>
                  <CheckCircle size={16} />
                  Gjenopprettet!
                </>
              ) : isRestoring ? (
                <>
                  <RotateCcw size={16} className="animate-spin" />
                  Gjenoppretter...
                </>
              ) : (
                <>
                  <RotateCcw size={16} />
                  Gjenopprett versjon
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionHistoryModal
