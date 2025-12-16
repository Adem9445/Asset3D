import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { Building2, MapPin, Search, Filter, RefreshCw, Layers, Info, AlertCircle, Box, List } from 'lucide-react'
import useAssetStore from '../stores/assetStore'
import useBuildingStore from '../stores/buildingStore'

import FurnitureLibrary from '../components/3d/FurnitureLibrary'
import { getAssetDimensions } from '../utils/assetPositioning'

// Lazy load SplitView
const SplitView = lazy(() => import('../components/SplitView'))

const formatCurrency = (value) => {
  if (!value && value !== 0) return '—'
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const AssetViewer = () => {
  const {
    assets,
    categories,
    stats,
    loading: assetsLoading,
    fetchAssets,
    fetchCategories,
    setFilters,
    getFilteredAssets,
    addLocalAsset,
    deleteAsset,
    updateAsset
  } = useAssetStore()

  const {
    buildings,
    selectedBuildingId,
    loading: buildingLoading,
    error: buildingError,
    fetchBuildings,
    fetchBuilding,
    selectBuilding
  } = useBuildingStore()

  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or '3d'

  const selectedBuilding = useMemo(
    () => buildings.find(building => building.id === selectedBuildingId) || null,
    [buildings, selectedBuildingId]
  )

  // Fetch detailed building data when selected
  useEffect(() => {
    if (selectedBuildingId) {
      fetchBuilding(selectedBuildingId).catch(() => { })
    }
  }, [selectedBuildingId, fetchBuilding])

  const availableRooms = useMemo(() => {
    if (!selectedBuilding) return []

    // Check for flat rooms array
    if (Array.isArray(selectedBuilding.rooms)) return selectedBuilding.rooms

    // Check for floors with rooms (Location structure)
    if (Array.isArray(selectedBuilding.floors)) {
      return selectedBuilding.floors.flatMap(floor => floor.rooms || [])
    }

    return []
  }, [selectedBuilding])

  const selectedRoom = useMemo(
    () => availableRooms.find(room => room.id === selectedRoomId) || null,
    [availableRooms, selectedRoomId]
  )

  const buildingAssetCount = useMemo(
    () => availableRooms.reduce(
      (sum, room) => sum + (room.assets?.length || 0),
      0
    ),
    [availableRooms]
  )

  const baseAssets = getFilteredAssets()

  const latestAssetTimestamp = useMemo(() => {
    if (!baseAssets.length) {
      return null
    }

    return baseAssets.reduce((latest, asset) => {
      const timestamp = asset.updated_at || asset.created_at
      if (!timestamp) {
        return latest
      }

      if (!latest) {
        return timestamp
      }

      return new Date(timestamp).getTime() > new Date(latest).getTime()
        ? timestamp
        : latest
    }, null)
  }, [baseAssets])

  useEffect(() => {
    fetchCategories().catch(() => { })
  }, [fetchCategories])

  useEffect(() => {
    fetchBuildings()
      .then(list => {
        if (!list?.length) return
        const currentId = selectedBuildingId || list[0].id
        selectBuilding(currentId)
      })
      .catch(() => { })
  }, [fetchBuildings, selectBuilding])

  useEffect(() => {
    if (selectedBuilding) {
      const hasRoom = Array.isArray(availableRooms) && availableRooms.some(room => room.id === selectedRoomId)
      if (!hasRoom) {
        setSelectedRoomId(availableRooms?.[0]?.id || null)
      }
    } else {
      setSelectedRoomId(null)
    }
  }, [selectedBuilding, selectedRoomId, availableRooms])

  useEffect(() => {
    setFilters({
      roomId: selectedRoomId,
      categoryId,
      status,
      searchTerm: search
    })
  }, [selectedRoomId, categoryId, status, search, setFilters])

  useEffect(() => {
    fetchAssets(selectedRoomId, categoryId).catch(() => { })
  }, [selectedRoomId, categoryId, fetchAssets])
  const filteredAssets = useMemo(() => {
    if (!selectedBuilding || selectedRoomId) {
      return baseAssets
    }

    const rooms = Array.isArray(availableRooms) ? availableRooms : []
    const roomIds = new Set(rooms.map(room => room.id))
    return baseAssets.filter(asset => roomIds.has(asset.room_id))
  }, [availableRooms, baseAssets, selectedBuilding, selectedRoomId])

  const handleRefresh = async () => {
    await fetchBuildings().catch(() => { })
    await fetchAssets(selectedRoomId, categoryId).catch(() => { })
  }

  const renderStatusBadge = (assetStatus) => {
    const normalized = (assetStatus || 'ukjent').toLowerCase()
    const config = {
      active: 'bg-green-100 text-green-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      retired: 'bg-gray-200 text-gray-700',
      fault: 'bg-red-100 text-red-700'
    }
    const style = config[normalized] || 'bg-slate-100 text-slate-700'

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </span>
    )
  }

  const [editMode, setEditMode] = useState('view') // 'view', 'move', 'edit'

  const handleAssetDelete = async (assetId) => {
    if (window.confirm('Er du sikker på at du vil slette denne eiendelen?')) {
      try {
        await deleteAsset(assetId)
        console.log('Asset deleted:', assetId)
      } catch (error) {
        console.error('Failed to delete asset:', error)
        alert('Kunne ikke slette eiendel')
      }
    }
  }

  const handleAssetUpdate = async (assetId, updates) => {
    console.log('Asset update:', assetId, updates)
    try {
      await updateAsset(assetId, updates)
    } catch (error) {
      console.error('Failed to update asset:', error)
    }
  }

  const handleAssetCreate = (assetType, position) => {
    console.log('Create asset:', assetType, 'at', position)

    if (!selectedRoomId) return

    let finalPosition = position

    // Clamp position to room bounds
    if (selectedRoom?.width && selectedRoom?.depth) {
      const dims = getAssetDimensions(assetType)
      const halfWidth = selectedRoom.width / 2
      const halfDepth = selectedRoom.depth / 2

      // Add 0.1 margin for wall thickness
      const minX = -halfWidth + dims.width / 2 + 0.1
      const maxX = halfWidth - dims.width / 2 - 0.1
      const minZ = -halfDepth + dims.depth / 2 + 0.1
      const maxZ = halfDepth - dims.depth / 2 - 0.1

      finalPosition = [
        Math.max(minX, Math.min(maxX, position[0])),
        position[1],
        Math.max(minZ, Math.min(maxZ, position[2]))
      ]
    }

    const newAsset = {
      id: `temp-${Date.now()}`,
      name: `Ny ${assetType}`,
      type: assetType,
      category_name: 'Nytt utstyr', // Foreløpig kategori
      room_id: selectedRoomId,
      room_name: selectedRoom?.name,
      position: finalPosition,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      status: 'active',
      purchase_price: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    addLocalAsset(newAsset)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eiendelsoversikt</h1>
          <p className="text-gray-600 mt-2">Utforsk bygninger, rom og registrerte eiendeler for din organisasjon.</p>
        </div>
        <div className="flex items-center gap-3">
          {viewMode === '3d' && (
            <div className="bg-gray-100 p-1 rounded-lg flex items-center mr-2">
              <button
                onClick={() => setEditMode('view')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${editMode === 'view'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Visning
              </button>
              <button
                onClick={() => setEditMode('edit')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${editMode === 'edit'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Rediger
              </button>
            </div>
          )}
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <List size={16} />
              Liste
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === '3d'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Box size={16} />
              3D Visning
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            type="button"
          >
            <RefreshCw className={`w-4 h-4 ${assetsLoading || buildingLoading ? 'animate-spin' : ''}`} />
            Oppdater
          </button>
        </div>
      </div>

      {buildingError && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 flex-shrink-0">
          <AlertCircle className="w-5 h-5" />
          <span>{buildingError}</span>
        </div>
      )}

      {viewMode === '3d' ? (
        <div className="flex-1 min-h-0 flex gap-4">
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {selectedRoom ? (
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              }>
                <SplitView
                  room={selectedRoom}
                  assets={filteredAssets}
                  editMode={editMode}
                  showGrid={true}
                  onAssetUpdate={handleAssetUpdate}
                  onAssetDelete={handleAssetDelete}
                  onAssetCreate={handleAssetCreate}
                />
              </Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Box size={48} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">Ingen rom valgt</p>
                <p className="text-sm">Velg et rom fra listen for å se 3D-visning</p>

                {/* Room selector for 3D view when no room is selected */}
                <div className="mt-6 w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Velg rom</label>
                  <select
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={selectedRoomId || ''}
                    onChange={(event) => setSelectedRoomId(event.target.value || null)}
                  >
                    <option value="">Velg et rom...</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Furniture Library Sidebar */}
          {editMode === 'edit' && (
            <div className="w-64 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
              <FurnitureLibrary />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Valgt bygning</p>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedBuilding?.name || 'Ingen bygning tilgjengelig'}
                  </h2>
                  {selectedBuilding?.address && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedBuilding.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Bygning</label>
                <select
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={selectedBuildingId || ''}
                  onChange={(event) => selectBuilding(event.target.value || null)}
                  disabled={buildingLoading || !buildings.length}
                >
                  {!buildings.length && <option value="">Ingen bygninger</option>}
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBuilding && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-500">Rom</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedBuilding.rooms?.length || 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-500">Etasjer</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedBuilding.floors?.length || 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs uppercase text-slate-500">Eiendeler</p>
                    <p className="text-lg font-semibold text-slate-900">{buildingAssetCount}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Rom i bygningen</h3>
              </div>
              {buildingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 border-b-2 border-blue-500 rounded-full animate-spin" />
                </div>
              ) : availableRooms.length ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRoomId(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg border ${selectedRoomId === null ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    Alle rom
                  </button>
                  {availableRooms.map(room => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border ${room.id === selectedRoomId ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{room.name}</span>
                        <span className="text-xs text-gray-500">{room.assets?.length || 0} eiendeler</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {room.type || 'Ukjent type'} • Etasje {room.floor_number || room.floor || '—'}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Ingen rom registrert for denne bygningen ennå.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Søk</label>
                  <div className="mt-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="search"
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Søk etter navn, beskrivelse eller type"
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <div className="mt-1 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:border-blue-500 focus:ring-blue-500"
                      value={categoryId || ''}
                      onChange={event => setCategoryId(event.target.value || null)}
                    >
                      <option value="">Alle kategorier</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:border-blue-500 focus:ring-blue-500"
                    value={status}
                    onChange={event => setStatus(event.target.value)}
                  >
                    <option value="all">Alle statuser</option>
                    <option value="active">Aktiv</option>
                    <option value="maintenance">Vedlikehold</option>
                    <option value="retired">Avhendet</option>
                    <option value="fault">Feil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Totalt antall</p>
                  <p className="text-2xl font-semibold text-slate-900">{filteredAssets.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Eiendeler som matcher filtrene</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Estimert verdi</p>
                  <p className="text-2xl font-semibold text-slate-900">{formatCurrency(stats.totalValue)}</p>
                  <p className="text-xs text-slate-500 mt-1">Basert på registrert kjøpspris</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-500">Sist oppdatert</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {latestAssetTimestamp ? formatDate(latestAssetTimestamp) : '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Viser siste endrede eiendel</p>
                </div>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Eiendeler</h3>
                  <p className="text-sm text-gray-500">Detaljert liste over eiendeler i valgte bygning og rom.</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {assetsLoading ? 'Laster data…' : `${filteredAssets.length} eiendeler`}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Navn</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rom</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verdi</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sist oppdatert</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAssets.length === 0 && !assetsLoading && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                          Ingen eiendeler matcher de valgte filtrene.
                        </td>
                      </tr>
                    )}

                    {assetsLoading && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                          Laster eiendeler…
                        </td>
                      </tr>
                    )}

                    {!assetsLoading && filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.description || 'Ingen beskrivelse'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.category_name || 'Ukjent kategori'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.room_name || (Array.isArray(availableRooms) && availableRooms.find(room => room.id === asset.room_id)?.name) || 'Ikke plassert'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {renderStatusBadge(asset.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(asset.purchase_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(asset.updated_at || asset.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetViewer
