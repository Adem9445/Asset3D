import { useState, useEffect, useCallback, lazy, Suspense, memo } from 'react'
import storageService from '../services/storageService'
import { debounce } from '../utils/performanceUtils.jsx'
import { findNonCollidingPosition, getAssetDimensions } from '../utils/assetPositioning'

// Lazy load heavy components for better initial load
const RoomEditor3D = lazy(() => import('../components/3d/RoomEditor3D'))
const RoomBuilder = lazy(() => import('../components/3d/RoomBuilder'))
const BuildingView3D = lazy(() => import('../components/3d/BuildingView3D'))
const Room2DView = lazy(() => import('../components/2d/Room2DView'))
const SplitView = lazy(() => import('../components/SplitView'))
const AssetLibrary = lazy(() => import('../components/AssetLibrary'))
const ExportImportModal = lazy(() => import('../components/ExportImportModal'))
const AssetDetailPanel = lazy(() => import('../components/AssetDetailPanel'))
const SaveStatusIndicator = lazy(() => import('../components/SaveStatusIndicator'))
const VersionHistoryModal = lazy(() => import('../components/VersionHistoryModal'))
import { useAuthStore } from '../stores/authStore'
import { Building, Package, Maximize2, Split, Grid3x3, Edit, Move, RotateCw, Trash2, Settings, Save, Upload, Download, Square, Eye, Scale3d, Cloud, CloudOff, Check, AlertCircle } from 'lucide-react'
import { Layers, Home, Sofa, Monitor } from 'lucide-react'

const AssetViewer = () => {
  const [building, setBuilding] = useState({
    id: '1',
    name: 'Hovedkontor',
    address: 'Karl Johans gate 1, Oslo',
    floors: [
      {
        id: 'f1',
        name: '1. Etasje',
        rooms: [
          { id: 'r1', name: 'Resepsjon', type: 'reception' },
          { id: 'r2', name: 'Møterom 1', type: 'meeting' },
          { id: 'r3', name: 'Kantine', type: 'cafeteria' }
        ]
      },
      {
        id: 'f2',
        name: '2. Etasje',
        rooms: [
          { id: 'r4', name: 'Kontor 201', type: 'office' },
          { id: 'r5', name: 'Kontor 202', type: 'office' },
          { id: 'r6', name: 'Møterom 2', type: 'meeting' }
        ]
      }
    ],
    rooms: [
      { 
        id: 'r1', 
        name: 'Resepsjon', 
        type: 'reception', 
        assets: [
          { id: 'a1', type: 'desk', name: 'Resepsjonspult', position: [0, 0, -2], category: 'Møbler' },
          { id: 'a2', type: 'chair', name: 'Kontorstol', position: [0, 0, -1], category: 'Møbler' },
          { id: 'a3', type: 'sofa', name: 'Ventesofa', position: [3, 0, 0], rotation: [0, Math.PI/2, 0], category: 'Møbler' },
          { id: 'a4', type: 'plant', name: 'Dekorativ plante', position: [-3, 0, -2], category: 'Dekor' }
        ] 
      },
      { 
        id: 'r2', 
        name: 'Møterom 1', 
        type: 'meeting', 
        assets: [
          { id: 'a5', type: 'meetingTable', name: 'Møtebord', position: [0, 0, 0], category: 'Møbler' },
          { id: 'a6', type: 'chair', name: 'Møtestol 1', position: [-1.5, 0, 0], category: 'Møbler' },
          { id: 'a7', type: 'chair', name: 'Møtestol 2', position: [1.5, 0, 0], category: 'Møbler' },
          { id: 'a8', type: 'whiteboard', name: 'Whiteboard', position: [0, 0, -3], category: 'Kontorutstyr' }
        ] 
      },
      { 
        id: 'r3', 
        name: 'Kantine', 
        type: 'cafeteria', 
        assets: [
          { id: 'a9', type: 'refrigerator', name: 'Kjøleskap', position: [-3, 0, -2], category: 'Kjøkken' },
          { id: 'a10', type: 'coffeeMachine', name: 'Kaffemaskin', position: [-2, 0, -2], category: 'Kjøkken' },
          { id: 'a11', type: 'microwave', name: 'Mikrobølgeovn', position: [-1, 0, -2], category: 'Kjøkken' },
          { id: 'a12', type: 'waterCooler', name: 'Vannkjøler', position: [2, 0, -2], category: 'Kjøkken' }
        ] 
      },
      { 
        id: 'r4', 
        name: 'Kontor 201', 
        type: 'office', 
        assets: [
          { id: 'a13', type: 'desk', name: 'Arbeidspult', position: [0, 0, 0], category: 'Møbler' },
          { id: 'a14', type: 'chair', name: 'Ergonomisk stol', position: [0, 0, 1], rotation: [0, Math.PI, 0], category: 'Møbler' },
          { id: 'a15', type: 'computer', name: 'Arbeidsstasjon', position: [0, 0.75, 0], category: 'IT' },
          { id: 'a16', type: 'bookshelf', name: 'Bokhylle', position: [3, 0, 0], rotation: [0, -Math.PI/2, 0], category: 'Møbler' },
          { id: 'a17', type: 'filingCabinet', name: 'Arkivskap', position: [-3, 0, 0], category: 'Kontor' }
        ] 
      },
      { 
        id: 'r5', 
        name: 'Kontor 202', 
        type: 'office', 
        assets: [
          { id: 'a18', type: 'desk', name: 'Arbeidspult', position: [0, 0, 0], category: 'Møbler' },
          { id: 'a19', type: 'chair', name: 'Kontorstol', position: [0, 0, 1], rotation: [0, Math.PI, 0], category: 'Møbler' },
          { id: 'a20', type: 'printer', name: 'Skriver', position: [2, 0, 0], category: 'IT' },
          { id: 'a21', type: 'trashBin', name: 'Søppelbøtte', position: [1, 0, 1], category: 'Kontor' }
        ] 
      },
      { 
        id: 'r6', 
        name: 'Møterom 2', 
        type: 'meeting', 
        assets: [
          { id: 'a22', type: 'meetingTable', name: 'Stort møtebord', position: [0, 0, 0], scale: [1.5, 1, 1.2], category: 'Møbler' },
          { id: 'a23', type: 'phone', name: 'Konferansetelefon', position: [0, 0.75, 0], category: 'IT' }
        ] 
      }
    ]
  })

  const [selectedRoom, setSelectedRoom] = useState(building.rooms[0])
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showAssetLibrary, setShowAssetLibrary] = useState(false)
  const [showExportImport, setShowExportImport] = useState(false)
  const [showAssetDetail, setShowAssetDetail] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [viewMode, setViewMode] = useState('3d')
  const [editMode, setEditMode] = useState('view')
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved', 'saving', 'unsaved', 'error'
  const [lastSaved, setLastSaved] = useState(null)
  const { token } = useAuthStore()
  
  // Load data on mount
  useEffect(() => {
    loadBuildingData()
    
    // Enable auto-save
    storageService.enableAutoSave(() => {
      saveBuildingData()
    }, 30000) // Auto-save every 30 seconds
    
    // Register keyboard shortcuts using the enhanced storage service
    storageService.registerShortcut('ctrl+s', () => saveBuildingData())
    storageService.registerShortcut('cmd+s', () => saveBuildingData())
    storageService.registerShortcut('ctrl+e', () => setShowExportImport(true))
    storageService.registerShortcut('cmd+e', () => setShowExportImport(true))
    storageService.registerShortcut('ctrl+shift+a', () => setShowAssetLibrary(true))
    storageService.registerShortcut('cmd+shift+a', () => setShowAssetLibrary(true))
    
    // Register save callback for status updates
    const unsubscribe = storageService.onSave(({ timestamp }) => {
      console.log('Data saved at:', timestamp)
    })
    
    return () => {
      unsubscribe()
    }
  }, [])
  
  // Load building data
  const loadBuildingData = async () => {
    const savedBuilding = await storageService.loadBuilding(building.id, token)
    if (savedBuilding) {
      setBuilding(savedBuilding)
      if (savedBuilding.rooms?.length > 0) {
        setSelectedRoom(savedBuilding.rooms[0])
      }
    }
  }
  
  // Save building data with debounce for performance
  const saveBuildingData = useCallback(
    debounce(async () => {
      setSaveStatus('saving')
      try {
        // Prepare building data with floor associations
        const buildingData = {
          ...building,
          floors: building.floors.map(floor => ({
            ...floor,
            rooms: floor.rooms.map(roomRef => {
              const fullRoom = building.rooms.find(r => r.id === roomRef.id)
              return {
                id: roomRef.id,
                name: roomRef.name || fullRoom?.name,
                type: roomRef.type || fullRoom?.type,
                assetCount: fullRoom?.assets?.length || 0
              }
            })
          })),
          metadata: {
            lastModified: new Date().toISOString(),
            totalAssets: building.rooms.reduce((sum, r) => sum + (r.assets?.length || 0), 0),
            totalRooms: building.rooms.length,
            totalFloors: building.floors.length
          }
        }
        
        console.log('Saving building with', buildingData.metadata)
        await storageService.saveBuilding(buildingData, token)
        setSaveStatus('saved')
        setLastSaved(new Date())
        setTimeout(() => {
          if (saveStatus === 'saved') setSaveStatus('saved')
        }, 2000)
      } catch (error) {
        setSaveStatus('error')
        console.error('Lagring feilet:', error)
      }
    }, 1000),
    [building, token, saveStatus]
  )

  const handleAssetUpdate = (assetId, updates) => {
    console.log(`🔧 Updating asset ${assetId} with:`, updates)
    
    // Find which room and floor this asset belongs to
    let assetRoom = null
    let assetFloor = null
    
    for (const room of building.rooms) {
      if (room.assets?.some(a => a.id === assetId)) {
        assetRoom = room
        assetFloor = building.floors.find(floor => 
          floor.rooms.some(r => r.id === room.id)
        )
        break
      }
    }
    
    if (assetRoom && assetFloor) {
      console.log(`📍 Asset found in room ${assetRoom.name} on floor ${assetFloor.name}`)
    }
    
    setBuilding(prev => {
      const updated = {
        ...prev,
        rooms: prev.rooms.map(room => ({
          ...room,
          assets: room.assets?.map(asset => {
            if (asset.id === assetId) {
              const updatedAsset = { ...asset, ...updates }
              console.log(`✅ Asset ${assetId} updated:`, updatedAsset)
              return updatedAsset
            }
            return asset
          }) || []
        }))
      }
      return updated
    })
    
    // Also update selected room if it contains the asset
    if (selectedRoom?.assets?.some(a => a.id === assetId)) {
      setSelectedRoom(prev => ({
        ...prev,
        assets: prev.assets?.map(asset => 
          asset.id === assetId ? { ...asset, ...updates } : asset
        ) || []
      }))
    }
    
    storageService.markAsChanged()
    setSaveStatus('unsaved')
    
    // Auto-save after updating asset
    setTimeout(() => {
      console.log('💾 Auto-saving after asset update...')
      saveBuildingData()
    }, 500)
  }

  const handleAssetDelete = (assetId) => {
    setBuilding(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => ({
        ...room,
        assets: room.assets?.filter(asset => asset.id !== assetId) || []
      }))
    }))
    setSelectedAsset(null)
    storageService.markAsChanged()
    setSaveStatus('unsaved')
  }

  const handleAddAsset = (assetData) => {
    if (!selectedRoom) {
      alert('Vennligst velg et rom først')
      return
    }
    
    // Find a non-colliding position for the new asset
    const existingAssets = selectedRoom.assets || []
    const roomBounds = selectedRoom.dimensions || { width: 10, depth: 10 }
    const position = findNonCollidingPosition(
      existingAssets, 
      assetData.type || 'default',
      roomBounds
    )
    
    const newAsset = {
      id: `asset_${Date.now()}`,
      ...assetData,
      position,
      rotation: assetData.rotation || [0, 0, 0],
      scale: assetData.scale || [1, 1, 1]
    }
    
    // Find which floor this room belongs to
    const roomFloor = building.floors.find(floor => 
      floor.rooms.some(r => r.id === selectedRoom.id)
    )
    
    console.log(`Adding asset to room ${selectedRoom.name} on floor ${roomFloor?.name} at position:`, position)
    
    setBuilding(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === selectedRoom.id
          ? { ...room, assets: [...(room.assets || []), newAsset] }
          : room
      )
    }))
    
    // Also update selected room
    setSelectedRoom(prev => ({
      ...prev,
      assets: [...(prev.assets || []), newAsset]
    }))
    
    setShowAssetLibrary(false)
    storageService.markAsChanged()
    setSaveStatus('unsaved')
    
    // Auto-save after adding asset
    setTimeout(() => saveBuildingData(), 500)
  }

  const handleAddRoom = (floorId) => {
    const newRoom = {
      id: `room_${Date.now()}`,
      name: `Nytt rom`,
      type: 'office',
      assets: [],
      floor: floorId
    }
    
    setBuilding(prev => ({
      ...prev,
      floors: prev.floors.map(floor => 
        floor.id === floorId
          ? { ...floor, rooms: [...floor.rooms, newRoom] }
          : floor
      ),
      rooms: [...prev.rooms, newRoom]
    }))
    storageService.markAsChanged()
    setSaveStatus('unsaved')
  }

  const handleAddFloor = () => {
    const floorNumber = building.floors.length + 1
    const newFloor = {
      id: `floor_${Date.now()}`,
      name: `${floorNumber}. Etasje`,
      rooms: []
    }
    
    setBuilding(prev => ({
      ...prev,
      floors: [...prev.floors, newFloor]
    }))
    storageService.markAsChanged()
    setSaveStatus('unsaved')
  }

  const handleEditFloor = (floorId, updates) => {
    setBuilding(prev => ({
      ...prev,
      floors: prev.floors.map(floor => 
        floor.id === floorId ? { ...floor, ...updates } : floor
      )
    }))
    storageService.markAsChanged()
    setSaveStatus('unsaved')
  }

  const handleDeleteFloor = (floorId) => {
    // Get all room IDs for this floor
    const floorToDelete = building.floors.find(f => f.id === floorId)
    const roomIdsToDelete = floorToDelete?.rooms.map(r => r.id) || []
    
    setBuilding(prev => ({
      ...prev,
      floors: prev.floors.filter(floor => floor.id !== floorId),
      rooms: prev.rooms.filter(room => !roomIdsToDelete.includes(room.id))
    }))
    
    // If selected room was on deleted floor, clear selection
    if (roomIdsToDelete.includes(selectedRoom?.id)) {
      setSelectedRoom(null)
    }
    
    storageService.markAsChanged()
    setSaveStatus('unsaved')
  }

  const assetCategories = [
    { id: 'furniture', name: 'Møbler', icon: Sofa },
    { id: 'electronics', name: 'Elektronikk', icon: Monitor },
    { id: 'office', name: 'Kontor', icon: Building },
    { id: 'other', name: 'Andre', icon: Package }
  ]

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toppbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">3D Aktivavisning</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home size={16} />
              <span>{building.name}</span>
              <span>•</span>
              <span>{building.address}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Visningsmodus */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === '3d' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                3D Rom
              </button>
              <button
                onClick={() => setViewMode('building')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'building' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bygg 3D
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === '2d' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                2D
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'split' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Delt
              </button>
              <button
                onClick={() => setViewMode('builder')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'builder' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Editor
              </button>
            </div>
            
            {/* Handlingsknapper */}
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={() => saveBuildingData()}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors ${
                  saveStatus === 'unsaved' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                  saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
                  saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}
                title="Lagre (Ctrl+S)"
              >
                <Save size={16} />
                {saveStatus === 'unsaved' ? 'Lagre' :
                 saveStatus === 'saving' ? 'Lagrer...' :
                 saveStatus === 'saved' ? 'Lagret' :
                 'Feil'}
              </button>
              <button 
                onClick={() => setShowExportImport(true)}
                className="p-2 hover:bg-gray-100 rounded-lg" 
                title="Eksport/Import"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={() => setShowAssetLibrary(true)}
                className="p-2 hover:bg-gray-100 rounded-lg" 
                title="Asset bibliotek"
              >
                <Package size={20} />
              </button>
              <Suspense fallback={<div className="w-40 h-10 bg-gray-200 animate-pulse rounded-lg"></div>}>
                <SaveStatusIndicator
                  status={saveStatus}
                  lastSaved={lastSaved}
                  onManualSave={saveBuildingData}
                  showVersionHistory={true}
                  onOpenVersions={() => setShowVersionHistory(true)}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Hovedinnhold */}
      <div className="flex flex-1 overflow-hidden">
        {/* Venstre sidebar */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Bygningsoversikt</h3>
              <button 
                onClick={handleAddFloor}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Etasje
              </button>
            </div>
            
            {/* Etasjer og rom */}
            <div className="space-y-2">
              {building.floors.map((floor, index) => (
                <div key={floor.id} className="border border-gray-200 rounded-lg">
                  <div className="p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-gray-500" />
                        <input
                          type="text"
                          value={floor.name}
                          onChange={(e) => handleEditFloor(floor.id, { name: e.target.value })}
                          className="font-medium bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        {building.floors.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Er du sikker på at du vil slette ${floor.name} og alle rommene?`)) {
                                handleDeleteFloor(floor.id)
                              }
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-500"
                            title="Slett etasje"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAddRoom(floor.id)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          + Rom
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {floor.rooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => {
                          const fullRoom = building.rooms.find(r => r.id === room.id)
                          setSelectedRoom(fullRoom)
                          console.log(`Selected room ${fullRoom?.name} on ${floor.name} with ${fullRoom?.assets?.length || 0} assets`)
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-50 ${
                          selectedRoom?.id === room.id ? 'bg-primary-50 text-primary-700' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{room.name}</span>
                          <span className="text-xs text-gray-500">
                            {building.rooms.find(r => r.id === room.id)?.assets?.length || 0} eiendeler
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Eiendeler i valgt rom */}
          {selectedRoom && (
            <div className="p-4 border-t">
              <div className="mb-3">
                {(() => {
                  const roomFloor = building.floors.find(floor => 
                    floor.rooms.some(r => r.id === selectedRoom.id)
                  )
                  return roomFloor && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium">
                      {roomFloor.name} → {selectedRoom.name}
                    </div>
                  )
                })()}
              </div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Eiendeler</h4>
                <button
                  onClick={() => setShowAssetLibrary(true)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Legg til
                </button>
              </div>
              
              <div className="space-y-2">
                {selectedRoom.assets?.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    Ingen eiendeler i dette rommet
                  </p>
                ) : (
                  selectedRoom.assets?.map(asset => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setSelectedAsset(asset)
                        setShowAssetDetail(true)
                      }}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedAsset?.id === asset.id ? 'bg-primary-50' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-500" />
                        <div>
                          <span className="text-sm font-medium">{asset.name}</span>
                          <span className="text-xs text-gray-500 block">{asset.category}</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssetDelete(asset.id)
                        }}
                        className="p-1 hover:bg-white rounded"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3D Visningsområde */}
        <div className="flex-1 relative">
          {/* Move mode notification */}
          {editMode === 'move' && (
            <div className="absolute top-20 left-4 z-10 bg-green-500 text-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
              <Move size={16} />
              <span className="text-sm font-medium">Flyttemodus aktivert - Dra møbler for å flytte dem</span>
            </div>
          )}
          
          {/* Redigeringsverktøy */}
          <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-1">
            <button
              onClick={() => {
                setEditMode('view')
                console.log('Edit mode: view')
              }}
              className={`p-2 rounded ${editMode === 'view' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
              title="Visning"
            >
              <Eye size={20} />
            </button>
            <button
              onClick={() => {
                setEditMode('move')
                console.log('Edit mode: move - Drag furniture to reposition')
              }}
              className={`p-2 rounded ${editMode === 'move' ? 'bg-green-500 text-white' : 'hover:bg-gray-100'}`}
              title="Flytt møbler (Dra for å flytte)"
            >
              <Move size={20} />
            </button>
            <button
              onClick={() => setEditMode('rotate')}
              className={`p-2 rounded ${editMode === 'rotate' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
              title="Roter"
            >
              <RotateCw size={20} />
            </button>
            <button
              onClick={() => setEditMode('scale')}
              className={`p-2 rounded ${editMode === 'scale' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
              title="Skaler"
            >
              <Scale3d size={20} />
            </button>
            <button className="ml-2 p-2 hover:bg-gray-100 rounded" title="Innstillinger">
              <Settings size={20} />
            </button>
          </div>

          {/* Hurtig Asset panel */}
          {editMode !== 'view' && (
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Legg til eiendeler</h4>
                <button
                  onClick={() => setShowAssetLibrary(true)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Vis bibliotek
                </button>
              </div>
              <div className="flex gap-2">
                {assetCategories.map(category => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setShowAssetLibrary(true)}
                      className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Icon size={24} className="text-gray-600 mb-1" />
                      <span className="text-xs">{category.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3D Rom Editor eller Builder */}
          <Suspense fallback={
            <div className="flex items-center justify-center w-full h-full bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Laster 3D visning...</p>
              </div>
            </div>
          }>
            {viewMode === 'building' ? (
              <BuildingView3D
                building={building}
                selectedRoom={selectedRoom}
                onRoomSelect={(room, floor) => {
                  setSelectedRoom(room)
                  console.log('Selected room:', room, 'on floor:', floor)
                }}
                viewSettings={{
                  floorHeight: 3,
                  enableShadows: true,
                  enableEnvironment: false
                }}
              />
            ) : viewMode === 'builder' ? (
              <RoomBuilder
                room={selectedRoom}
                assets={selectedRoom?.assets || []}
                onRoomUpdate={(updatedRoom) => {
                  const mergedRoom = {
                    ...updatedRoom,
                    assets: selectedRoom?.assets || [] // Preserve assets
                  }
                  setBuilding(prev => ({
                    ...prev,
                    rooms: prev.rooms.map(r => 
                      r.id === mergedRoom.id ? mergedRoom : r
                    )
                  }))
                  setSelectedRoom(mergedRoom)
                  storageService.markAsChanged()
                  setSaveStatus('unsaved')
                  setTimeout(() => saveBuildingData(), 500)
                }}
                onAssetUpdate={handleAssetUpdate}
                onAssetDelete={handleAssetDelete}
                floorInfo={building.floors.find(floor => 
                  floor.rooms.some(r => r.id === selectedRoom?.id)
                )}
                gridSize={0.5}
              />
            ) : viewMode === '2d' ? (
              <Room2DView
                room={selectedRoom}
                assets={selectedRoom?.assets || []}
                selectedAsset={selectedAsset}
                onAssetSelect={setSelectedAsset}
                onAssetUpdate={handleAssetUpdate}
                onAssetDelete={handleAssetDelete}
                editMode={editMode}
                showGrid={true}
              />
            ) : viewMode === 'split' ? (
              <SplitView
                room={selectedRoom}
                assets={selectedRoom?.assets || []}
                selectedAsset={selectedAsset}
                onAssetSelect={setSelectedAsset}
                onAssetUpdate={handleAssetUpdate}
                onAssetDelete={handleAssetDelete}
                editMode={editMode}
                showGrid={true}
              />
            ) : (
              <RoomEditor3D
                roomData={selectedRoom ? {
                  ...selectedRoom,
                  width: selectedRoom.width || 10,
                  height: selectedRoom.height || 3,
                  depth: selectedRoom.depth || 8
                } : null}
                building={building}
                assets={selectedRoom?.assets || []}
                onAssetSelect={setSelectedAsset}
                onAssetUpdate={handleAssetUpdate}
                onAssetDelete={handleAssetDelete}
                editMode={editMode}
                viewMode={viewMode}
                selectedAssetId={selectedAsset?.id}
              />
            )}
          </Suspense>
        </div>
      </div>

      {/* Asset Library Modal */}
      {showAssetLibrary && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>}>
          <AssetLibrary
            onClose={() => setShowAssetLibrary(false)}
            onSelectAsset={handleAddAsset}
            roomInfo={selectedRoom}
            floorInfo={building.floors.find(floor => 
              floor.rooms.some(r => r.id === selectedRoom?.id)
            )}
          />
        </Suspense>
      )}
      
      {/* Export/Import Modal */}
      {showExportImport && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>}>
          <ExportImportModal
          isOpen={showExportImport}
          onClose={() => setShowExportImport(false)}
          data={selectedRoom || building}
          dataType={selectedRoom ? 'room' : 'building'}
          onImport={(importedData) => {
            if (selectedRoom) {
              setBuilding(prev => ({
                ...prev,
                rooms: prev.rooms.map(r => 
                  r.id === selectedRoom.id ? { ...r, ...importedData } : r
                )
              }))
            } else {
              setBuilding(importedData)
            }
            setShowExportImport(false)
          }}
        />
        </Suspense>
      )}
      
      {/* Asset Detail Panel */}
      {showAssetDetail && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>}>
          <AssetDetailPanel
            asset={selectedAsset}
            isOpen={showAssetDetail}
            onClose={() => setShowAssetDetail(false)}
            onUpdate={(updatedAsset) => {
              handleAssetUpdate(updatedAsset.id, updatedAsset)
              setShowAssetDetail(false)
            }}
            onDelete={(assetId) => {
              handleAssetDelete(assetId)
              setShowAssetDetail(false)
            }}
          />
        </Suspense>
      )}
      
      {/* Version History Modal */}
      {showVersionHistory && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>}>
          <VersionHistoryModal
            isOpen={showVersionHistory}
            onClose={() => setShowVersionHistory(false)}
            dataKey="current_building"
          />
        </Suspense>
      )}
    </div>
  )
}

export default AssetViewer
