import { useState, Suspense, lazy, useMemo } from 'react'
import { Maximize2, Minimize2, RotateCw } from 'lucide-react'

// Lazy load heavy components
const Room2DView = lazy(() => import('./2d/Room2DView'))
const RoomEditor3D = lazy(() => import('./3d/RoomEditor3D'))

/**
 * Split View Component - Shows 2D and 3D views side by side
 */
const SplitView = ({
  room,
  assets = [],
  selectedAsset,
  onAssetSelect,
  onAssetUpdate,
  onAssetDelete,
  onAssetCreate,
  editMode = 'view',
  showGrid = true
}) => {
  const [splitRatio, setSplitRatio] = useState(50) // Percentage for left panel
  const [isDragging, setIsDragging] = useState(false)
  const [focusedView, setFocusedView] = useState(null) // null, '2d', or '3d'

  const handleDividerDrag = (e) => {
    if (!isDragging) return

    const container = e.currentTarget.parentElement
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSplitRatio(Math.max(20, Math.min(80, percentage)))
  }

  const handleDividerMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const LoadingView = () => (
    <div className="flex items-center justify-center w-full h-full bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Laster visning...</p>
      </div>
    </div>
  )

  const roomData = useMemo(() => room ? {
    ...room,
    width: room.width || 10,
    height: room.height || 3,
    depth: room.depth || 8
  } : null, [room])

  return (
    <div
      className="relative w-full h-full flex"
      onMouseMove={handleDividerDrag}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 2D View */}
      <div
        className={`relative border-r border-gray-300 transition-all ${focusedView === '3d' ? 'hidden' : ''
          }`}
        style={{
          width: focusedView === '2d' ? '100%' : `${splitRatio}%`
        }}
      >
        {/* 2D View Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">2D Visning</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFocusedView(focusedView === '2d' ? null : '2d')}
              className="p-1 hover:bg-gray-100 rounded"
              title={focusedView === '2d' ? 'Vis delt skjerm' : 'Maksimer'}
            >
              {focusedView === '2d' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* 2D Content */}
        <div className="pt-10 h-full">
          <Suspense fallback={<LoadingView />}>
            <Room2DView
              room={roomData}
              assets={assets}
              selectedAsset={selectedAsset}
              onAssetSelect={onAssetSelect}
              onAssetUpdate={onAssetUpdate}
              onAssetDelete={onAssetDelete}
              editMode={editMode}
              showGrid={showGrid}
            />
          </Suspense>
        </div>
      </div>

      {/* Divider */}
      {!focusedView && (
        <div
          className={`absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-blue-500 transition-colors z-30 ${isDragging ? 'bg-blue-500' : ''
            }`}
          style={{
            left: `${splitRatio}%`,
            cursor: 'col-resize',
            marginLeft: '-2px'
          }}
          onMouseDown={handleDividerMouseDown}
        >
          {/* Drag handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-full p-1 shadow-lg">
              <svg width="8" height="16" viewBox="0 0 8 16" className="text-gray-400">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
                <circle cx="6" cy="2" r="1" fill="currentColor" />
                <circle cx="2" cy="8" r="1" fill="currentColor" />
                <circle cx="6" cy="8" r="1" fill="currentColor" />
                <circle cx="2" cy="14" r="1" fill="currentColor" />
                <circle cx="6" cy="14" r="1" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 3D View */}
      <div
        className={`relative flex-1 ${focusedView === '2d' ? 'hidden' : ''
          }`}
        style={{
          width: focusedView === '3d' ? '100%' : `${100 - splitRatio}%`
        }}
      >
        {/* 3D View Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">3D Visning</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFocusedView(focusedView === '3d' ? null : '3d')}
              className="p-1 hover:bg-gray-100 rounded"
              title={focusedView === '3d' ? 'Vis delt skjerm' : 'Maksimer'}
            >
              {focusedView === '3d' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* 3D Content */}
        <div className="pt-10 h-full">
          <Suspense fallback={<LoadingView />}>
            <RoomEditor3D
              roomData={roomData}
              assets={assets}
              onSelectAsset={onAssetSelect}
              onAssetUpdate={onAssetUpdate}
              onAssetDelete={onAssetDelete}
              onAssetCreate={onAssetCreate}
              selectedAssetId={selectedAsset?.id}
              editMode={editMode}
              showStats={false}
            />
          </Suspense>
        </div>
      </div>

      {/* Sync indicator */}
      <div className="absolute bottom-4 right-4 z-20 bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
        <RotateCw size={14} className="text-green-500 animate-pulse" />
        <span className="text-xs text-gray-600">Synkronisert</span>
      </div >
    </div >
  )
}

export default SplitView
