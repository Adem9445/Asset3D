import { useState, useEffect } from 'react'
import useAssetStore from '../../stores/assetStore'
import { 
  Package, Plus, Search, Filter, Download, Upload, 
  Edit2, Trash2, Eye, Grid3x3, List, ChevronLeft, 
  ChevronRight, MoreVertical, AlertCircle, Check
} from 'lucide-react'

/**
 * Asset Management Component for Admin Panel
 * Full CRUD operations for assets with filtering and bulk actions
 */
const AssetManagement = () => {
  const {
    assets,
    categories,
    loading,
    error,
    filters,
    stats,
    fetchAssets,
    fetchCategories,
    createAsset,
    updateAsset,
    deleteAsset,
    bulkDeleteAssets,
    setFilters,
    clearFilters,
    getFilteredAssets
  } = useAssetStore()
  
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [selectedAssets, setSelectedAssets] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  useEffect(() => {
    fetchAssets()
    fetchCategories()
  }, [])
  
  const filteredAssets = getFilteredAssets()
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  const handleSelectAll = () => {
    if (selectedAssets.length === paginatedAssets.length) {
      setSelectedAssets([])
    } else {
      setSelectedAssets(paginatedAssets.map(a => a.id))
    }
  }
  
  const handleSelectAsset = (assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }
  
  const handleBulkDelete = async () => {
    if (window.confirm(`Er du sikker på at du vil slette ${selectedAssets.length} assets?`)) {
      await bulkDeleteAssets(selectedAssets)
      setSelectedAssets([])
      setShowBulkActions(false)
    }
  }
  
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredAssets, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `assets_export_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Asset Management</h1>
        <p className="text-gray-600">Administrer alle eiendeler på tvers av systemet</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold">{stats.totalAssets}</span>
          </div>
          <p className="text-sm text-gray-600">Totalt Assets</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-600">NOK</span>
            <span className="text-xl font-bold">
              {new Intl.NumberFormat('nb-NO').format(stats.totalValue || 0)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Total Verdi</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-600">📍</span>
            <span className="text-xl font-bold">
              {Object.keys(stats.byLocation || {}).length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Lokasjoner</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-600">📂</span>
            <span className="text-xl font-bold">{categories.length}</span>
          </div>
          <p className="text-sm text-gray-600">Kategorier</p>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Søk assets..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ searchTerm: e.target.value })}
                className="pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={filters.categoryId || ''}
              onChange={(e) => setFilters({ categoryId: e.target.value || null })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle kategorier</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            
            {/* Clear Filters */}
            {(filters.searchTerm || filters.categoryId) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Nullstill filter
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List size={18} />
              </button>
            </div>
            
            {/* Actions */}
            {selectedAssets.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 flex items-center gap-2"
              >
                {selectedAssets.length} valgt
              </button>
            )}
            
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Eksporter"
            >
              <Download size={18} />
            </button>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={18} />
              Ny Asset
            </button>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {showBulkActions && selectedAssets.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm flex items-center gap-1"
            >
              <Trash2 size={16} />
              Slett valgte ({selectedAssets.length})
            </button>
            <button
              onClick={() => {
                setSelectedAssets([])
                setShowBulkActions(false)
              }}
              className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
            >
              Avbryt
            </button>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
      
      {/* Assets Display */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen assets funnet</h3>
          <p className="text-gray-600">
            {filters.searchTerm || filters.categoryId 
              ? 'Prøv å justere filteret ditt'
              : 'Opprett din første asset for å komme i gang'
            }
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedAssets.map(asset => (
            <div key={asset.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={() => handleSelectAsset(asset.id)}
                    className="mt-1"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingAsset(asset)
                        setShowEditModal(true)
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Er du sikker på at du vil slette denne asseten?')) {
                          deleteAsset(asset.id)
                        }
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">{asset.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{asset.category_name || 'Ukategorisert'}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{asset.room_name || 'Ikke plassert'}</span>
                  {asset.purchase_price && (
                    <span>NOK {new Intl.NumberFormat('nb-NO').format(asset.purchase_price)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAssets.length === paginatedAssets.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Navn</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Kategori</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Lokasjon</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Verdi</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="p-3 text-right text-sm font-medium text-gray-700">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.map(asset => (
                <tr key={asset.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => handleSelectAsset(asset.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{asset.name}</td>
                  <td className="p-3 text-sm text-gray-600">{asset.category_name || 'Ukategorisert'}</td>
                  <td className="p-3 text-sm text-gray-600">{asset.room_name || 'Ikke plassert'}</td>
                  <td className="p-3 text-sm">
                    {asset.purchase_price 
                      ? `NOK ${new Intl.NumberFormat('nb-NO').format(asset.purchase_price)}`
                      : '-'
                    }
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Aktiv
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingAsset(asset)
                          setShowEditModal(true)
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Er du sikker på at du vil slette denne asseten?')) {
                            deleteAsset(asset.id)
                          }
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Viser {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAssets.length)} av {filteredAssets.length} assets
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded ${currentPage === 1 ? 'text-gray-300' : 'hover:bg-gray-100'}`}
            >
              <ChevronLeft size={18} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-300' : 'hover:bg-gray-100'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetManagement
