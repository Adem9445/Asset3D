import { useState, useRef, useEffect } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Grid3x3,
  Move,
  RotateCw,
  Trash2
} from 'lucide-react'
import { getAssetDimensions, checkCollision, snapToGrid } from '../../utils/assetPositioning'

/**
 * 2D Room View Component - Top-down visualization
 */
const Room2DView = ({
  room,
  assets = [],
  selectedAsset,
  onAssetSelect,
  onAssetUpdate,
  onAssetDelete,
  editMode = 'view',
  showGrid = true
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [scale, setScale] = useState(30) // pixels per meter
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [hoveredAsset, setHoveredAsset] = useState(null)

  // Convert world coordinates to canvas coordinates
  const worldToCanvas = (worldX, worldZ) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    return {
      x: centerX + (worldX * scale) + offset.x,
      y: centerY + (worldZ * scale) + offset.y
    }
  }

  // Convert canvas coordinates to world coordinates
  const canvasToWorld = (canvasX, canvasY) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, z: 0 }

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    return {
      x: (canvasX - centerX - offset.x) / scale,
      z: (canvasY - centerY - offset.y) / scale
    }
  }

  // Draw room on canvas
  const drawRoom = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 2])

      const gridSize = 1 // 1 meter grid
      const gridPixels = gridSize * scale

      for (let x = offset.x % gridPixels; x < width; x += gridPixels) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let y = offset.y % gridPixels; y < height; y += gridPixels) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      ctx.setLineDash([])
    }

    // Draw room walls
    if (room?.walls) {
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 3
      ctx.fillStyle = '#f3f4f6'

      ctx.beginPath()
      room.walls.forEach((wall, index) => {
        const start = worldToCanvas(wall.start[0], wall.start[2])
        const end = worldToCanvas(wall.end[0], wall.end[2])

        if (index === 0) {
          ctx.moveTo(start.x, start.y)
        }
        ctx.lineTo(end.x, end.y)
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else if (room?.width && room?.depth) {
      // Draw floor area
      const floorPos = worldToCanvas(0, 0)
      const floorW = room.width * scale
      const floorD = room.depth * scale

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(floorPos.x - floorW / 2, floorPos.y - floorD / 2, floorW, floorD)

      // Draw 3D-matched walls (Back, Left, Right) with thickness
      const wallThickness = 0.2 // 20cm, same as 3D
      const halfWidth = room.width / 2
      const halfDepth = room.depth / 2

      ctx.fillStyle = '#e5e7eb' // Wall color
      ctx.strokeStyle = '#374151' // Wall border
      ctx.lineWidth = 1

      // Helper to draw wall rect
      const drawWall = (x, z, w, d) => {
        const pos = worldToCanvas(x, z)
        const pixelW = w * scale
        const pixelD = d * scale

        ctx.beginPath()
        ctx.rect(pos.x - pixelW / 2, pos.y - pixelD / 2, pixelW, pixelD)
        ctx.fill()
        ctx.stroke()
      }

      // Back Wall (at -Z)
      drawWall(0, -halfDepth, room.width, wallThickness)

      // Left Wall (at -X)
      drawWall(-halfWidth, 0, wallThickness, room.depth)

      // Right Wall (at +X)
      drawWall(halfWidth, 0, wallThickness, room.depth)
    }

    // Draw assets
    assets.forEach(asset => {
      const dims = getAssetDimensions(asset.type || 'default')
      const pos = worldToCanvas(asset.position[0], asset.position[2])

      // Calculate size in pixels
      const width = dims.width * scale
      const depth = dims.depth * scale

      // Set style based on selection and hover
      if (asset.id === selectedAsset?.id) {
        ctx.fillStyle = '#3b82f6'
        ctx.globalAlpha = 0.8
      } else if (asset.id === hoveredAsset?.id) {
        ctx.fillStyle = '#60a5fa'
        ctx.globalAlpha = 0.9
      } else {
        // Color by category
        switch (asset.category) {
          case 'Møbler':
            ctx.fillStyle = '#8b7355'
            break
          case 'IT':
            ctx.fillStyle = '#4a5568'
            break
          case 'Kjøkken':
            ctx.fillStyle = '#718096'
            break
          default:
            ctx.fillStyle = '#9ca3af'
        }
        ctx.globalAlpha = 1
      }

      // Draw asset rectangle
      ctx.save()
      ctx.translate(pos.x, pos.y)
      if (asset.rotation && asset.rotation[1]) {
        ctx.rotate(asset.rotation[1])
      }
      ctx.fillRect(-width / 2, -depth / 2, width, depth)

      // Draw border
      ctx.strokeStyle = '#1f2937'
      ctx.lineWidth = 1
      ctx.strokeRect(-width / 2, -depth / 2, width, depth)

      // Draw asset name
      ctx.fillStyle = '#ffffff'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(asset.name, 0, 0)

      ctx.restore()
      ctx.globalAlpha = 1
    })

    // Draw room name
    if (room?.name) {
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(room.name, 10, 25)
    }

    // Draw scale indicator
    const meterInPixels = scale
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width - 100, height - 30)
    ctx.lineTo(width - 100 + meterInPixels, height - 30)
    ctx.stroke()

    ctx.fillStyle = '#6b7280'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('1m', width - 100 + meterInPixels / 2, height - 15)
  }

  // Handle canvas interactions
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const worldPos = canvasToWorld(x, y)

    // Check if clicking on an asset
    const clickedAsset = assets.find(asset => {
      const dims = getAssetDimensions(asset.type || 'default')
      const dx = Math.abs(worldPos.x - asset.position[0])
      const dz = Math.abs(worldPos.z - asset.position[2])
      return dx < dims.width / 2 && dz < dims.depth / 2
    })

    if (clickedAsset) {
      onAssetSelect?.(clickedAsset)
      if (editMode === 'move') {
        setIsDragging(true)
        setDragStart({ x, y, asset: clickedAsset })
      }
    } else if (e.button === 1 || e.shiftKey) {
      // Middle mouse or shift for panning
      setIsDragging(true)
      setDragStart({ x, y, pan: true })
    }
  }

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const worldPos = canvasToWorld(x, y)

    // Check hover
    const hovered = assets.find(asset => {
      const dims = getAssetDimensions(asset.type || 'default')
      const dx = Math.abs(worldPos.x - asset.position[0])
      const dz = Math.abs(worldPos.z - asset.position[2])
      return dx < dims.width / 2 && dz < dims.depth / 2
    })
    setHoveredAsset(hovered)

    // Handle dragging
    if (isDragging && dragStart) {
      if (dragStart.pan) {
        // Panning the view
        setOffset({
          x: offset.x + (x - dragStart.x),
          y: offset.y + (y - dragStart.y)
        })
        setDragStart({ ...dragStart, x, y })
      } else if (dragStart.asset) {
        // Moving an asset
        let newX = worldPos.x
        let newZ = worldPos.z

        // Constrain to room bounds if room dimensions exist
        if (room?.width && room?.depth) {
          const dims = getAssetDimensions(dragStart.asset.type || 'default')

          // Adjust dimensions for rotation
          const rotationY = dragStart.asset.rotation ? dragStart.asset.rotation[1] : 0
          const isRotated90 = Math.round(Math.abs(rotationY) / (Math.PI / 2)) % 2 === 1

          const effectiveWidth = isRotated90 ? dims.depth : dims.width
          const effectiveDepth = isRotated90 ? dims.width : dims.depth

          const minX = -room.width / 2 + effectiveWidth / 2 + 0.1
          const maxX = room.width / 2 - effectiveWidth / 2 - 0.1
          const minZ = -room.depth / 2 + effectiveDepth / 2 + 0.1
          const maxZ = room.depth / 2 - effectiveDepth / 2 - 0.1

          newX = Math.max(minX, Math.min(maxX, newX))
          newZ = Math.max(minZ, Math.min(maxZ, newZ))
        }

        const newPos = snapToGrid([newX, 0, newZ])
        onAssetUpdate?.(dragStart.asset.id, { position: newPos })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(s => Math.max(10, Math.min(200, s * delta)))
  }

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (container && canvas) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        drawRoom()
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Redraw when data changes
  useEffect(() => {
    drawRoom()
  }, [room, assets, scale, offset, showGrid, selectedAsset, hoveredAsset])

  const exportCanvas = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `${room?.name || 'room'}_2d.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="relative w-full h-full bg-gray-50" ref={containerRef}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setScale(s => Math.min(200, s * 1.2))}
          className="p-2 hover:bg-gray-100 rounded"
          title="Zoom inn"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => setScale(s => Math.max(10, s * 0.8))}
          className="p-2 hover:bg-gray-100 rounded"
          title="Zoom ut"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={() => {
            setScale(50)
            setOffset({ x: 0, y: 0 })
          }}
          className="p-2 hover:bg-gray-100 rounded"
          title="Tilbakestill visning"
        >
          <Maximize size={20} />
        </button>
        <div className="w-px bg-gray-200" />
        <button
          onClick={() => drawRoom()}
          className={`p-2 rounded ${showGrid ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          title="Vis rutenett"
        >
          <Grid3x3 size={20} />
        </button>
        <button
          onClick={exportCanvas}
          className="p-2 hover:bg-gray-100 rounded"
          title="Eksporter bilde"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Edit tools */}
      {editMode !== 'view' && selectedAsset && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2">
          <button
            onClick={() => onAssetUpdate?.(selectedAsset.id, {
              rotation: [0, (selectedAsset.rotation?.[1] || 0) + Math.PI / 4, 0]
            })}
            className="p-2 hover:bg-gray-100 rounded"
            title="Roter"
          >
            <RotateCw size={20} />
          </button>
          <button
            onClick={() => onAssetDelete?.(selectedAsset.id)}
            className="p-2 hover:bg-red-100 rounded text-red-600"
            title="Slett"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}

      {/* Info panel */}
      {hoveredAsset && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm font-medium">{hoveredAsset.name}</div>
          <div className="text-xs text-gray-600">{hoveredAsset.category}</div>
          <div className="text-xs text-gray-500">
            Posisjon: ({hoveredAsset.position[0].toFixed(1)}, {hoveredAsset.position[2].toFixed(1)})
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : hoveredAsset ? 'pointer' : 'crosshair' }}
      />
    </div>
  )
}

export default Room2DView
