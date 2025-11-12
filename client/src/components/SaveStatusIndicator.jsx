import { useEffect, useState } from 'react'
import { Save, Check, AlertCircle, Cloud, CloudOff, Loader2, History } from 'lucide-react'
import storageService from '../services/storageService'

/**
 * SaveStatusIndicator - Visuell indikator for lagringsstatus
 * Viser sanntidsstatus for lagring med animasjoner og farger
 */
const SaveStatusIndicator = ({ 
  status = 'saved', 
  lastSaved = null,
  onManualSave,
  showVersionHistory = false,
  onOpenVersions
}) => {
  const [animateStatus, setAnimateStatus] = useState(false)
  const [timeAgo, setTimeAgo] = useState('')
  const [storageInfo, setStorageInfo] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Status konfigurasjon
  const statusConfig = {
    saved: {
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Alle endringer lagret',
      pulse: false
    },
    saving: {
      icon: Loader2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      message: 'Lagrer endringer...',
      pulse: true,
      spin: true
    },
    unsaved: {
      icon: Save,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      message: 'Ulagrede endringer',
      pulse: true
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: 'Lagring feilet',
      pulse: false
    },
    offline: {
      icon: CloudOff,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      message: 'Offline - lokal lagring',
      pulse: false
    }
  }
  
  const config = statusConfig[status] || statusConfig.saved
  const Icon = config.icon
  
  // Oppdater tid siden sist lagret
  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastSaved) {
        setTimeAgo('')
        return
      }
      
      const now = new Date()
      const saved = new Date(lastSaved)
      const diffSeconds = Math.floor((now - saved) / 1000)
      
      if (diffSeconds < 5) {
        setTimeAgo('Nettopp')
      } else if (diffSeconds < 60) {
        setTimeAgo(`${diffSeconds} sekunder siden`)
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60)
        setTimeAgo(`${minutes} ${minutes === 1 ? 'minutt' : 'minutter'} siden`)
      } else if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600)
        setTimeAgo(`${hours} ${hours === 1 ? 'time' : 'timer'} siden`)
      } else {
        setTimeAgo(saved.toLocaleDateString('nb-NO'))
      }
    }
    
    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 5000)
    
    return () => clearInterval(interval)
  }, [lastSaved])
  
  // Hent lagringsinformasjon
  useEffect(() => {
    const interval = setInterval(() => {
      setStorageInfo(storageService.getStorageInfo())
    }, 10000)
    
    setStorageInfo(storageService.getStorageInfo())
    
    return () => clearInterval(interval)
  }, [])
  
  // Animer status endringer
  useEffect(() => {
    setAnimateStatus(true)
    const timer = setTimeout(() => setAnimateStatus(false), 500)
    return () => clearTimeout(timer)
  }, [status])
  
  // Keyboard shortcut info
  const keyboardShortcut = navigator.platform.match('Mac') ? '⌘S' : 'Ctrl+S'
  
  return (
    <div className="relative">
      {/* Hoved status indikator */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300
          ${config.bgColor} ${config.borderColor}
          ${animateStatus ? 'scale-105' : 'scale-100'}
          ${config.pulse ? 'animate-pulse' : ''}
          cursor-pointer
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onManualSave}
      >
        <Icon 
          size={18} 
          className={`
            ${config.color} 
            ${config.spin ? 'animate-spin' : ''}
          `}
        />
        
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.message}
          </span>
          {timeAgo && status === 'saved' && (
            <span className="text-xs text-gray-500">
              {timeAgo}
            </span>
          )}
        </div>
        
        {/* Quick save button */}
        {status === 'unsaved' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onManualSave?.()
            }}
            className={`
              ml-2 px-2 py-1 text-xs rounded
              ${config.bgColor} ${config.color}
              hover:opacity-80 transition-opacity
              border ${config.borderColor}
            `}
            title={`Lagre nå (${keyboardShortcut})`}
          >
            {keyboardShortcut}
          </button>
        )}
      </div>
      
      {/* Tooltip med detaljer */}
      {showTooltip && storageInfo && (
        <div className="absolute top-full mt-2 right-0 z-50 w-64 p-3 bg-white rounded-lg shadow-lg border">
          <div className="space-y-2">
            {/* Lagringsstatus */}
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Lagringsinformasjon
              </div>
              <div className="text-xs text-gray-600">
                {storageInfo.itemCount} objekter lagret
              </div>
              <div className="text-xs text-gray-600">
                Total størrelse: {storageInfo.totalSize}
              </div>
            </div>
            
            {/* Sist lagret */}
            {lastSaved && (
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-600">
                  Sist lagret: {new Date(lastSaved).toLocaleString('nb-NO')}
                </div>
              </div>
            )}
            
            {/* Auto-save status */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Auto-lagring</span>
                <span className="text-xs font-semibold text-green-600">Aktiv</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Lagrer automatisk hver 30. sekund
              </div>
            </div>
            
            {/* Keyboard shortcuts */}
            <div className="pt-2 border-t">
              <div className="text-xs font-semibold text-gray-700 mb-1">
                Hurtigtaster
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Lagre manuelt</span>
                  <span className="font-mono bg-gray-100 px-1 rounded">{keyboardShortcut}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Eksporter</span>
                  <span className="font-mono bg-gray-100 px-1 rounded">
                    {navigator.platform.match('Mac') ? '⌘E' : 'Ctrl+E'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Version history button */}
            {showVersionHistory && (
              <div className="pt-2 border-t">
                <button
                  onClick={onOpenVersions}
                  className="w-full px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                >
                  <History size={12} />
                  Vis versjonshistorikk
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Floating notification for status changes */}
      {(status === 'saved' || status === 'error') && animateStatus && (
        <div className={`
          absolute -top-10 right-0 px-3 py-1 rounded-full
          ${status === 'saved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          text-xs font-medium shadow-lg
          animate-in slide-in-from-top fade-in duration-300
        `}>
          {status === 'saved' ? '✓ Lagret!' : '✗ Feil ved lagring'}
        </div>
      )}
    </div>
  )
}

/**
 * Mini version for toolbar/header
 */
export const SaveStatusMini = ({ status, onSave }) => {
  const statusColors = {
    saved: 'bg-green-500',
    saving: 'bg-blue-500 animate-pulse',
    unsaved: 'bg-yellow-500',
    error: 'bg-red-500',
    offline: 'bg-gray-500'
  }
  
  return (
    <button
      onClick={onSave}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Lagringsstatus - Klikk for å lagre"
    >
      <Cloud size={20} className="text-gray-600" />
      <span 
        className={`
          absolute bottom-1 right-1 w-2 h-2 rounded-full
          ${statusColors[status] || statusColors.saved}
        `}
      />
    </button>
  )
}

export default SaveStatusIndicator
