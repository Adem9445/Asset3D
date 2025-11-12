import { useState, useEffect } from 'react'
import { X, Edit2, Save, Plus, Trash2, Calendar, DollarSign, Package, MapPin, User, FileText, AlertCircle, Check } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

/**
 * Asset Detail Panel - Viser og redigerer detaljert informasjon om en asset
 */
const AssetDetailPanel = ({ 
  asset, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  assetTypes 
}) => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [editMode, setEditMode] = useState(false)
  const [editedAsset, setEditedAsset] = useState(asset || {})
  const [customFields, setCustomFields] = useState([])
  const [saveStatus, setSaveStatus] = useState('')

  // Forhåndsdefinerte felt-typer for admin
  const fieldTypes = [
    { id: 'text', label: 'Tekst', icon: FileText },
    { id: 'number', label: 'Tall', icon: DollarSign },
    { id: 'date', label: 'Dato', icon: Calendar },
    { id: 'select', label: 'Valg', icon: Package },
    { id: 'textarea', label: 'Lang tekst', icon: FileText },
    { id: 'user', label: 'Bruker', icon: User },
    { id: 'location', label: 'Lokasjon', icon: MapPin }
  ]

  // Standard felter for alle assets
  const standardFields = [
    { key: 'name', label: 'Navn', type: 'text', required: true },
    { key: 'type', label: 'Type', type: 'select', required: true },
    { key: 'category', label: 'Kategori', type: 'select', required: true },
    { key: 'serialNumber', label: 'Serienummer', type: 'text' },
    { key: 'purchaseDate', label: 'Kjøpsdato', type: 'date' },
    { key: 'purchasePrice', label: 'Innkjøpspris', type: 'number', prefix: 'NOK' },
    { key: 'currentValue', label: 'Nåværende verdi', type: 'number', prefix: 'NOK' },
    { key: 'warranty', label: 'Garanti utløper', type: 'date' },
    { key: 'supplier', label: 'Leverandør', type: 'text' },
    { key: 'responsible', label: 'Ansvarlig', type: 'user' },
    { key: 'location', label: 'Plassering', type: 'location' },
    { key: 'status', label: 'Status', type: 'select', options: ['Aktiv', 'Under vedlikehold', 'Skadet', 'Utrangert'] },
    { key: 'notes', label: 'Notater', type: 'textarea' }
  ]

  // Asset-spesifikke felter basert på type
  const assetSpecificFields = {
    computer: [
      { key: 'processor', label: 'Prosessor', type: 'text' },
      { key: 'ram', label: 'RAM (GB)', type: 'number' },
      { key: 'storage', label: 'Lagring (GB)', type: 'number' },
      { key: 'operatingSystem', label: 'Operativsystem', type: 'text' },
      { key: 'ipAddress', label: 'IP-adresse', type: 'text' },
      { key: 'macAddress', label: 'MAC-adresse', type: 'text' }
    ],
    printer: [
      { key: 'model', label: 'Modell', type: 'text' },
      { key: 'printType', label: 'Type', type: 'select', options: ['Laser', 'Inkjet', 'Multifunksjon'] },
      { key: 'paperCapacity', label: 'Papirkapasitet', type: 'number' },
      { key: 'monthlyVolume', label: 'Månedlig volum', type: 'number' },
      { key: 'tonerLevel', label: 'Toner nivå (%)', type: 'number' },
      { key: 'networkName', label: 'Netverksnavn', type: 'text' }
    ],
    desk: [
      { key: 'material', label: 'Materiale', type: 'select', options: ['Tre', 'Glass', 'Metall', 'Laminat'] },
      { key: 'adjustable', label: 'Høydejusterbar', type: 'select', options: ['Ja', 'Nei'] },
      { key: 'width', label: 'Bredde (cm)', type: 'number' },
      { key: 'depth', label: 'Dybde (cm)', type: 'number' },
      { key: 'height', label: 'Høyde (cm)', type: 'number' }
    ],
    chair: [
      { key: 'material', label: 'Materiale', type: 'text' },
      { key: 'ergonomic', label: 'Ergonomisk', type: 'select', options: ['Ja', 'Nei'] },
      { key: 'armrests', label: 'Armlener', type: 'select', options: ['Ja', 'Nei'] },
      { key: 'wheels', label: 'Hjul', type: 'select', options: ['Ja', 'Nei'] },
      { key: 'maxWeight', label: 'Maks vekt (kg)', type: 'number' }
    ],
    refrigerator: [
      { key: 'capacity', label: 'Kapasitet (liter)', type: 'number' },
      { key: 'energyClass', label: 'Energiklasse', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'C'] },
      { key: 'temperature', label: 'Temperatur (°C)', type: 'number' },
      { key: 'freezerCapacity', label: 'Fryser (liter)', type: 'number' }
    ],
    washingMachine: [
      { key: 'capacity', label: 'Kapasitet (kg)', type: 'number' },
      { key: 'energyClass', label: 'Energiklasse', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B'] },
      { key: 'rpm', label: 'Sentrifuge (rpm)', type: 'number' },
      { key: 'programs', label: 'Antall programmer', type: 'number' }
    ],
    dishwasher: [
      { key: 'capacity', label: 'Kuverter', type: 'number' },
      { key: 'energyClass', label: 'Energiklasse', type: 'select', options: ['A+++', 'A++', 'A+', 'A'] },
      { key: 'waterUsage', label: 'Vannforbruk (liter)', type: 'number' },
      { key: 'noiseLevel', label: 'Støynivå (dB)', type: 'number' }
    ]
  }

  useEffect(() => {
    if (asset) {
      setEditedAsset(asset)
      // Hent custom fields for denne asset-typen
      const typeFields = assetSpecificFields[asset.type] || []
      setCustomFields(typeFields)
    }
  }, [asset])

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await onUpdate(editedAsset)
      setSaveStatus('saved')
      setEditMode(false)
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (error) {
      setSaveStatus('error')
      console.error('Feil ved lagring:', error)
    }
  }

  const handleFieldChange = (key, value) => {
    setEditedAsset(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addCustomField = () => {
    if (!isAdmin) return
    
    const newField = {
      key: `custom_${Date.now()}`,
      label: 'Nytt felt',
      type: 'text',
      custom: true
    }
    setCustomFields([...customFields, newField])
  }

  const removeCustomField = (fieldKey) => {
    if (!isAdmin) return
    setCustomFields(customFields.filter(f => f.key !== fieldKey))
  }

  const renderField = (field) => {
    const value = editedAsset[field.key] || ''
    
    if (!editMode) {
      return (
        <div key={field.key} className="py-2">
          <label className="text-xs text-gray-500">{field.label}</label>
          <div className="font-medium">
            {field.prefix && <span className="text-gray-500 mr-1">{field.prefix}</span>}
            {value || '-'}
          </div>
        </div>
      )
    }

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className="py-2">
            <label className="text-xs text-gray-500">{field.label}</label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={3}
            />
          </div>
        )
      
      case 'select':
        return (
          <div key={field.key} className="py-2">
            <label className="text-xs text-gray-500">{field.label}</label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Velg...</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )
      
      case 'number':
        return (
          <div key={field.key} className="py-2">
            <label className="text-xs text-gray-500">{field.label}</label>
            <div className="flex items-center">
              {field.prefix && <span className="text-gray-500 mr-2">{field.prefix}</span>}
              <input
                type="number"
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        )
      
      case 'date':
        return (
          <div key={field.key} className="py-2">
            <label className="text-xs text-gray-500">{field.label}</label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        )
      
      default:
        return (
          <div key={field.key} className="py-2">
            <label className="text-xs text-gray-500">
              {field.label}
              {field.custom && isAdmin && editMode && (
                <button
                  onClick={() => removeCustomField(field.key)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              disabled={!editMode}
            />
          </div>
        )
    }
  }

  if (!isOpen || !asset) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Asset Detaljer</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-sm text-gray-500">ID: {asset.id}</div>
            <div className="font-medium">{editedAsset.name || 'Uten navn'}</div>
          </div>
          
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit2 size={16} />
              Rediger
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  saveStatus === 'saved' ? 'bg-green-600 text-white' :
                  saveStatus === 'saving' ? 'bg-blue-600 text-white' :
                  saveStatus === 'error' ? 'bg-red-600 text-white' :
                  'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saveStatus === 'saved' ? <Check size={16} /> :
                 saveStatus === 'error' ? <AlertCircle size={16} /> :
                 <Save size={16} />}
                {saveStatus === 'saved' ? 'Lagret' :
                 saveStatus === 'saving' ? 'Lagrer...' :
                 saveStatus === 'error' ? 'Feil' :
                 'Lagre'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false)
                  setEditedAsset(asset)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Avbryt
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Standard felter */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Generell informasjon</h3>
          <div className="space-y-1">
            {standardFields.map(field => renderField(field))}
          </div>
        </div>

        {/* Type-spesifikke felter */}
        {customFields.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">
              {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} - Spesifikk informasjon
            </h3>
            <div className="space-y-1">
              {customFields.map(field => renderField(field))}
            </div>
          </div>
        )}

        {/* Admin: Legg til custom felt */}
        {isAdmin && editMode && (
          <div className="mb-6">
            <button
              onClick={addCustomField}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center gap-2 text-gray-600"
            >
              <Plus size={16} />
              Legg til felt
            </button>
          </div>
        )}

        {/* Handlingsknapper */}
        <div className="pt-4 border-t">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm('Er du sikker på at du vil slette denne asseten?')) {
                  onDelete(asset.id)
                  onClose()
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Slett asset
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 pt-4 border-t text-xs text-gray-500">
          <div>Opprettet: {asset.createdAt || 'Ukjent'}</div>
          <div>Sist oppdatert: {asset.updatedAt || 'Ukjent'}</div>
          {asset.position && (
            <div>Posisjon: [{asset.position.map(p => p.toFixed(1)).join(', ')}]</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssetDetailPanel
