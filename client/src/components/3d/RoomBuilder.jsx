import { useState, useRef, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Grid, 
  Line,
  Text,
  Box,
  Edges,
  Html
} from '@react-three/drei'
import * as THREE from 'three'
import DragDropManager from './DragDropManager'
import { 
  findNonCollidingPosition, 
  validateAssetPositions, 
  getRoomBoundsFromWalls,
  getAssetDimensions,
  snapToGrid
} from '../../utils/assetPositioning'

/**
 * Wall component - representerer en vegg som kan redigeres
 */
const Wall = ({ start, end, height = 3, thickness = 0.2, onUpdate, onSelect, isSelected, wallId }) => {
  const meshRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [dragPoint, setDragPoint] = useState(null)
  
  // Beregn vegg dimensjoner og posisjon
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[2] - start[2], 2)
  )
  
  const centerX = (start[0] + end[0]) / 2
  const centerZ = (start[2] + end[2]) / 2
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0])
  
  return (
    <group>
      {/* Vegg mesh */}
      <mesh
        ref={meshRef}
        position={[centerX, height/2, centerZ]}
        rotation={[0, angle, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(wallId)
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          setIsDragging(true)
          setDragPoint(e.point)
        }}
        onPointerMove={(e) => {
          if (isDragging && dragPoint) {
            const delta = {
              x: e.point.x - dragPoint.x,
              z: e.point.z - dragPoint.z
            }
            onUpdate?.(wallId, delta)
            setDragPoint(e.point)
          }
        }}
        onPointerUp={() => {
          setIsDragging(false)
          setDragPoint(null)
        }}
      >
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial 
          color={isSelected ? "#3b82f6" : "#ffffff"} 
          transparent={isSelected}
          opacity={isSelected ? 0.8 : 1}
        />
        {isSelected && <Edges color="#1e40af" lineWidth={2} />}
      </mesh>
      
      {/* Corner handles */}
      <CornerHandle position={start} onDrag={(delta) => onUpdate?.(wallId, { start: delta })} />
      <CornerHandle position={end} onDrag={(delta) => onUpdate?.(wallId, { end: delta })} />
      
      {/* Dimensjon tekst */}
      {isSelected && (
        <Html position={[centerX, height + 0.5, centerZ]}>
          <div className="bg-black/75 text-white text-xs px-2 py-1 rounded">
            {length.toFixed(1)}m
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Corner handle for dragging wall endpoints
 */
const CornerHandle = ({ position, onDrag, size = 0.3 }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  
  return (
    <mesh
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation()
        setIsDragging(true)
        setDragStart(e.point)
      }}
      onPointerMove={(e) => {
        if (isDragging && dragStart) {
          const delta = [
            e.point.x - dragStart.x,
            0,
            e.point.z - dragStart.z
          ]
          onDrag(delta)
          setDragStart(e.point)
        }
      }}
      onPointerUp={() => {
        setIsDragging(false)
        setDragStart(null)
      }}
      onPointerLeave={() => {
        setIsDragging(false)
        setDragStart(null)
      }}
    >
      <sphereGeometry args={[size]} />
      <meshStandardMaterial 
        color={isDragging ? "#ef4444" : "#3b82f6"} 
        emissive={isDragging ? "#ef4444" : "#3b82f6"}
        emissiveIntensity={0.5}
      />
    </mesh>
  )
}

/**
 * Room Builder - Hovedkomponent for rom-bygging
 */
const RoomBuilder = ({ 
  room,
  assets = [],
  onRoomUpdate,
  onAssetUpdate,
  onAssetDelete,
  showGrid = true,
  snapToGrid = true,
  gridSize = 0.5,
  floorInfo = null
}) => {
  const [walls, setWalls] = useState(room?.walls || [
    { id: 'w1', start: [-5, 0, -5], end: [5, 0, -5] }, // Bakvegg
    { id: 'w2', start: [5, 0, -5], end: [5, 0, 5] },   // Høyre vegg
    { id: 'w3', start: [5, 0, 5], end: [-5, 0, 5] },   // Frontvegg
    { id: 'w4', start: [-5, 0, 5], end: [-5, 0, -5] }  // Venstre vegg
  ])
  
  const [selectedWall, setSelectedWall] = useState(null)
  const [roomDimensions, setRoomDimensions] = useState({
    width: 10,
    depth: 10,
    height: 3
  })
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingStart, setDrawingStart] = useState(null)
  const [drawingEnd, setDrawingEnd] = useState(null)
  
  // Snap til grid
  const snapToGridValue = (value) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }
  
  // Oppdater vegg
  const updateWall = (wallId, delta) => {
    setWalls(prevWalls => 
      prevWalls.map(wall => {
        if (wall.id === wallId) {
          const newWall = { ...wall }
          if (delta.start) {
            newWall.start = [
              snapToGridValue(wall.start[0] + delta.start[0]),
              wall.start[1],
              snapToGridValue(wall.start[2] + delta.start[2])
            ]
          }
          if (delta.end) {
            newWall.end = [
              snapToGridValue(wall.end[0] + delta.end[0]),
              wall.end[1],
              snapToGridValue(wall.end[2] + delta.end[2])
            ]
          }
          if (delta.x !== undefined || delta.z !== undefined) {
            // Flytt hele veggen
            const dx = delta.x || 0
            const dz = delta.z || 0
            newWall.start = [
              snapToGridValue(wall.start[0] + dx),
              wall.start[1],
              snapToGridValue(wall.start[2] + dz)
            ]
            newWall.end = [
              snapToGridValue(wall.end[0] + dx),
              wall.end[1],
              snapToGridValue(wall.end[2] + dz)
            ]
          }
          return newWall
        }
        return wall
      })
    )
    
    // Callback til parent
    if (onRoomUpdate) {
      onRoomUpdate({ ...room, walls })
    }
  }
  
  // Legg til ny vegg
  const addWall = (start, end) => {
    const newWall = {
      id: `w${Date.now()}`,
      start: [snapToGridValue(start[0]), 0, snapToGridValue(start[2])],
      end: [snapToGridValue(end[0]), 0, snapToGridValue(end[2])]
    }
    setWalls([...walls, newWall])
  }
  
  // Slett vegg
  const deleteWall = (wallId) => {
    setWalls(walls.filter(w => w.id !== wallId))
    setSelectedWall(null)
  }
  
  // Beregn rom areal
  const calculateArea = () => {
    // Enkel bounding box beregning
    const xCoords = walls.flatMap(w => [w.start[0], w.end[0]])
    const zCoords = walls.flatMap(w => [w.start[2], w.end[2]])
    const width = Math.max(...xCoords) - Math.min(...xCoords)
    const depth = Math.max(...zCoords) - Math.min(...zCoords)
    return width * depth
  }
  
  return (
    <div className="relative w-full h-full">
      {/* Kontrollpanel */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow-lg p-4 w-64">
        <h3 className="font-semibold mb-3">Rom Editor</h3>
        
        <div className="space-y-3">
          {/* Rom info */}
          <div className="text-sm space-y-1">
            {floorInfo && (
              <div className="flex justify-between mb-2 pb-2 border-b">
                <span className="text-gray-600">Etasje:</span>
                <span className="font-medium text-blue-600">{floorInfo.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Navn:</span>
              <input
                type="text"
                value={room?.name || 'Nytt rom'}
                onChange={(e) => onRoomUpdate?.({ ...room, name: e.target.value })}
                className="px-2 py-1 border rounded text-xs w-32"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Areal:</span>
              <span className="font-medium">{calculateArea().toFixed(1)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vegger:</span>
              <span className="font-medium">{walls.length}</span>
            </div>
          </div>
          
          {/* Verktøy */}
          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsDrawing(!isDrawing)}
                className={`px-3 py-2 text-xs rounded ${
                  isDrawing ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                {isDrawing ? 'Tegner...' : 'Tegn vegg'}
              </button>
              
              <button
                onClick={() => selectedWall && deleteWall(selectedWall)}
                disabled={!selectedWall}
                className="px-3 py-2 text-xs bg-red-500 text-white rounded disabled:bg-gray-200 disabled:text-gray-400"
              >
                Slett vegg
              </button>
              
              <button
                onClick={() => {
                  // Reset til standard rom
                  setWalls([
                    { id: 'w1', start: [-5, 0, -5], end: [5, 0, -5] },
                    { id: 'w2', start: [5, 0, -5], end: [5, 0, 5] },
                    { id: 'w3', start: [5, 0, 5], end: [-5, 0, 5] },
                    { id: 'w4', start: [-5, 0, 5], end: [-5, 0, -5] }
                  ])
                }}
                className="px-3 py-2 text-xs bg-gray-100 rounded"
              >
                Reset
              </button>
              
              <button
                onClick={() => {
                  // Eksporter rom data
                  const roomData = {
                    name: room?.name,
                    walls,
                    area: calculateArea(),
                    dimensions: roomDimensions
                  }
                  console.log('Eksportert rom:', roomData)
                  navigator.clipboard.writeText(JSON.stringify(roomData, null, 2))
                }}
                className="px-3 py-2 text-xs bg-green-500 text-white rounded"
              >
                Eksporter
              </button>
            </div>
          </div>
          
          {/* Hurtig dimensjoner */}
          <div className="border-t pt-3">
            <p className="text-xs font-medium mb-2">Hurtig resize:</p>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: '3x3', w: 3, d: 3 },
                { label: '5x5', w: 5, d: 5 },
                { label: '8x6', w: 8, d: 6 },
                { label: '10x8', w: 10, d: 8 },
                { label: '12x10', w: 12, d: 10 },
                { label: '15x12', w: 15, d: 12 }
              ].map(size => (
                <button
                  key={size.label}
                  onClick={() => {
                    const halfW = size.w / 2
                    const halfD = size.d / 2
                    setWalls([
                      { id: 'w1', start: [-halfW, 0, -halfD], end: [halfW, 0, -halfD] },
                      { id: 'w2', start: [halfW, 0, -halfD], end: [halfW, 0, halfD] },
                      { id: 'w3', start: [halfW, 0, halfD], end: [-halfW, 0, halfD] },
                      { id: 'w4', start: [-halfW, 0, halfD], end: [-halfW, 0, -halfD] }
                    ])
                    setRoomDimensions({ ...roomDimensions, width: size.w, depth: size.d })
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                >
                  {size.label}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [15, 12, 15], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={5}
          maxDistance={30}
        />
        
        {/* Grid */}
        {showGrid && (
          <Grid
            args={[30, 30]}
            cellSize={gridSize}
            cellThickness={0.5}
            cellColor="#e5e7eb"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9ca3af"
            fadeDistance={30}
            fadeStrength={1}
          />
        )}
        
        {/* Gulv */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {/* Vegger */}
        {walls.map(wall => (
          <Wall
            key={wall.id}
            wallId={wall.id}
            start={wall.start}
            end={wall.end}
            height={roomDimensions.height}
            isSelected={selectedWall === wall.id}
            onSelect={setSelectedWall}
            onUpdate={updateWall}
          />
        ))}
        
        {/* Assets with collision detection */}
        {(() => {
          // Get room bounds and validate asset positions
          const roomBounds = getRoomBoundsFromWalls(walls)
          const validatedAssets = validateAssetPositions(assets, roomBounds)
          
          return validatedAssets.map((asset) => {
            const dims = getAssetDimensions(asset.type || 'default')
            const assetPosition = asset.position || [0, 0, 0]
            
            return (
              <DragDropManager
                key={asset.id}
                enabled={true}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                checkCollisions={true}
                constraints={{
                  minX: -roomBounds.width/2 + dims.width/2,
                  maxX: roomBounds.width/2 - dims.width/2,
                  minZ: -roomBounds.depth/2 + dims.depth/2,
                  maxZ: roomBounds.depth/2 - dims.depth/2
                }}
                onDragEnd={(data) => {
                  if (onAssetUpdate) {
                    onAssetUpdate(asset.id, { position: data.position })
                  }
                }}
              >
                <Box
                  position={assetPosition}
                  args={[dims.width, dims.height, dims.depth]}
                  castShadow
                  receiveShadow
                  userData={{ assetId: asset.id, isAsset: true }}
                >
                  <meshStandardMaterial 
                    color={
                      asset.category === 'Møbler' ? '#8b7355' :
                      asset.category === 'IT' ? '#4a5568' :
                      asset.category === 'Kjøkken' ? '#718096' :
                      '#cbd5e0'
                    }
                  />
                  <Edges color="#374151" />
                </Box>
                {/* Asset label */}
                <Html position={[assetPosition[0], dims.height + 0.3, assetPosition[2]]}>
                  <div className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {asset.name}
                  </div>
                </Html>
              </DragDropManager>
            )
          })
        })()}
        
        {/* Tegne ny vegg preview */}
        {isDrawing && drawingStart && drawingEnd && (
          <Line
            points={[
              [drawingStart[0], 0.1, drawingStart[2]],
              [drawingEnd[0], 0.1, drawingEnd[2]]
            ]}
            color="#3b82f6"
            lineWidth={3}
            dashed
            dashScale={5}
          />
        )}
        
        {/* Klikk handler for tegning */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          visible={false}
          onPointerDown={(e) => {
            if (isDrawing) {
              const point = e.point
              if (!drawingStart) {
                setDrawingStart([point.x, 0, point.z])
              } else {
                addWall(drawingStart, [point.x, 0, point.z])
                setDrawingStart(null)
                setDrawingEnd(null)
                setIsDrawing(false)
              }
            }
          }}
          onPointerMove={(e) => {
            if (isDrawing && drawingStart) {
              setDrawingEnd([e.point.x, 0, e.point.z])
            }
          }}
        >
          <planeGeometry args={[30, 30]} />
        </mesh>
      </Canvas>
    </div>
  )
}

export default RoomBuilder
