import { useEffect, useMemo, useState } from 'react'
import { Building2, MapPin, Search, Filter, RefreshCw, Layers, Info, AlertCircle } from 'lucide-react'
import useAssetStore from '../stores/assetStore'
import useBuildingStore from '../stores/buildingStore'

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
    getFilteredAssets
  } = useAssetStore()

  const {
    buildings,
    selectedBuildingId,
    loading: buildingLoading,
    error: buildingError,
    fetchBuildings,
    selectBuilding
  } = useBuildingStore()

  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const selectedBuilding = useMemo(
    () => buildings.find(building => building.id === selectedBuildingId) || null,
    [buildings, selectedBuildingId]
  )

  const availableRooms = useMemo(
    () => selectedBuilding?.rooms || [],
    [selectedBuilding]
  )

  const buildingAssetCount = useMemo(
    () => selectedBuilding?.rooms?.reduce(
      (sum, room) => sum + (room.assets?.length || 0),
      0
    ) || 0,
    [selectedBuilding]
  )

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
    fetchCategories().catch(() => {})
  }, [fetchCategories])

  useEffect(() => {
    fetchBuildings()
      .then(list => {
        if (!list?.length) return
        const currentId = selectedBuildingId || list[0].id
        selectBuilding(currentId)
      })
      .catch(() => {})
  }, [fetchBuildings, selectBuilding])

  useEffect(() => {
    if (selectedBuilding) {
      const hasRoom = selectedBuilding.rooms?.some(room => room.id === selectedRoomId)
      if (!hasRoom) {
        setSelectedRoomId(selectedBuilding.rooms?.[0]?.id || null)
      }
    } else {
      setSelectedRoomId(null)
    }
  }, [selectedBuilding, selectedRoomId])

  useEffect(() => {
    setFilters({
      roomId: selectedRoomId,
      categoryId,
      status,
      searchTerm: search
    })
  }, [selectedRoomId, categoryId, status, search, setFilters])

  useEffect(() => {
    fetchAssets(selectedRoomId, categoryId).catch(() => {})
  }, [selectedRoomId, categoryId, fetchAssets])

  const baseAssets = getFilteredAssets()
  const filteredAssets = useMemo(() => {
    if (!selectedBuilding || selectedRoomId) {
      return baseAssets
    }

    const roomIds = new Set(availableRooms.map(room => room.id))
    return baseAssets.filter(asset => roomIds.has(asset.room_id))
  }, [availableRooms, baseAssets, selectedBuilding, selectedRoomId])

  const handleRefresh = async () => {
    await fetchBuildings().catch(() => {})
    await fetchAssets(selectedRoomId, categoryId).catch(() => {})
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eiendelsoversikt</h1>
          <p className="text-gray-600 mt-2">Utforsk bygninger, rom og registrerte eiendeler for din organisasjon.</p>
        </div>
        <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{buildingError}</span>
        </div>
      )}

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
                        {asset.room_name || availableRooms.find(room => room.id === asset.room_id)?.name || 'Ikke plassert'}
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
    </div>
  )
}

export default AssetViewer
