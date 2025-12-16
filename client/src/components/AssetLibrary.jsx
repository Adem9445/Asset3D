import { useState } from 'react'
import { X, Search, Package, Sofa, Monitor, Coffee, Printer, Home } from 'lucide-react'
import { assetCatalog, getAllAssets, searchAssets } from '../data/assetCatalog'

const AssetLibrary = ({ onClose, onSelectAsset, roomInfo = null, floorInfo = null }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Alle', icon: Package },
    { id: 'furniture', name: 'Møbler', icon: Sofa },
    { id: 'office', name: 'Kontor', icon: Printer },
    { id: 'kitchen', name: 'Kjøkken', icon: Coffee },
    { id: 'appliances', name: 'Hvitevarer', icon: Home }
  ]

  const assets = selectedCategory === 'all' 
    ? (searchTerm ? searchAssets(searchTerm) : getAllAssets())
    : (assetCatalog[selectedCategory]?.items || []).filter(asset =>
        !searchTerm || asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase())
      )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-library-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="asset-library-title" className="text-2xl font-bold">Eiendelsbibliotek</h2>
              {(roomInfo || floorInfo) && (
                <p className="text-sm text-gray-600 mt-1">
                  Legger til i: {floorInfo?.name || ''} {floorInfo && roomInfo ? '→' : ''} {roomInfo?.name || ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Lukk"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Søk */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Søk etter eiendeler..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Søk etter eiendeler"
            />
          </div>
        </div>

        {/* Kategorier */}
        <div className="flex gap-2 p-4 border-b border-gray-200" role="tablist">
          {categories.map(category => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSelected
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Eiendeler grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {assets.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Ingen eiendeler funnet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelectAsset(asset)
                  }}
                  className="group p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    {asset.image ? (
                      <img 
                        src={asset.image} 
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex items-center justify-center ${asset.image ? 'hidden' : 'flex'}`}
                      style={{ display: asset.image ? 'none' : 'flex' }}
                    >
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{asset.name}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2 h-8">{asset.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary-600">
                      kr {asset.price?.toLocaleString('nb-NO') || '0'}
                    </p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {asset.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssetLibrary
