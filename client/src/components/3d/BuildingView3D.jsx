import { useState, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Grid, 
  Text,
  Box,
  Edges,
  Html,
  Environment,
  Sky,
  ContactShadows
} from '@react-three/drei'
import * as THREE from 'three'
import { prepareAssetFor3D } from '../../utils/assetTypeNormalizer'

/**
 * Floor component - renders a single floor with rooms
 */
const Floor = ({ 
  floor, 
  rooms, 
  floorIndex, 
  floorHeight = 3,
  opacity = 1,
  showWalls = true,
  showAssets = true,
  isTransparent = false,
  onRoomClick
}) => {
  const yPosition = floorIndex * floorHeight
  
  return (
    <group position={[0, yPosition, 0]}>
      {/* Floor plate */}
      <mesh 
        position={[0, -0.05, 0]} 
        receiveShadow
      >
        <boxGeometry args={[30, 0.1, 30]} />
        <meshStandardMaterial 
          color="#f0f0f0" 
          transparent={isTransparent}
          opacity={isTransparent ? 0.3 : 1}
        />
      </mesh>
      
      {/* Rooms */}
      {rooms.map((room, index) => {
        const roomData = room.walls || getDefaultWalls(room)
        // Position rooms side by side
        const roomPosition = room.position || [
          (index % 3 - 1) * 12, // 3 rooms per row, 12m spacing
          0,
          Math.floor(index / 3) * 12 // New row every 3 rooms
        ]
        
        return (
          <RoomVisualization
            key={room.id}
            room={room}
            walls={roomData}
            height={floorHeight}
            showAssets={showAssets}
            opacity={opacity}
            position={roomPosition}
            onRoomClick={() => onRoomClick?.(room, floor)}
          />
        )
      })}
      
      {/* Floor label */}
      <Html position={[-15, floorHeight/2, 0]}>
        <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
          {floor.name}
        </div>
      </Html>
    </group>
  )
}

/**
 * Room visualization with walls and assets
 */
const RoomVisualization = ({ 
  room, 
  walls, 
  height = 3, 
  opacity = 1, 
  showAssets = true,
  onRoomClick,
  position = [0, 0, 0] // Allow custom positioning
}) => {
  const [hovered, setHovered] = useState(false)
  
  // Calculate room center from walls
  const getRoomCenter = () => {
    if (!walls || walls.length === 0) return [0, 0, 0]
    
    const points = walls.flatMap(w => [w.start, w.end])
    const xSum = points.reduce((sum, p) => sum + p[0], 0)
    const zSum = points.reduce((sum, p) => sum + p[2], 0)
    
    return [xSum / points.length, height/2, zSum / points.length]
  }
  
  return (
    <group
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        onRoomClick?.()
      }}
    >
      {/* Room walls */}
      {walls?.map((wall, idx) => (
        <Wall
          key={`${room.id}-wall-${idx}`}
          start={wall.start}
          end={wall.end}
          height={height}
          opacity={opacity}
          color={hovered ? "#3b82f6" : "#ffffff"}
        />
      ))}
      
      {/* Room assets */}
      {showAssets && room.assets?.map((asset) => (
        <AssetMesh
          key={asset.id}
          asset={prepareAssetFor3D(asset)}
          opacity={opacity}
        />
      ))}
      
      {/* Room label */}
      <Html position={getRoomCenter()}>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          hovered ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700'
        }`}>
          {room.name}
        </div>
      </Html>
    </group>
  )
}

/**
 * Wall component
 */
const Wall = ({ start, end, height = 3, thickness = 0.2, opacity = 1, color = "#ffffff" }) => {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) + 
    Math.pow(end[2] - start[2], 2)
  )
  
  const centerX = (start[0] + end[0]) / 2
  const centerZ = (start[2] + end[2]) / 2
  const angle = Math.atan2(end[2] - start[2], end[0] - start[0])
  
  return (
    <mesh
      position={[centerX, height/2, centerZ]}
      rotation={[0, angle, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial 
        color={color} 
        transparent={opacity < 1}
        opacity={opacity}
      />
      <Edges color="#9ca3af" />
    </mesh>
  )
}

/**
 * Simple asset representation
 */
const AssetMesh = ({ asset, opacity = 1 }) => {
  const getAssetGeometry = (type) => {
    switch(type) {
      case 'desk':
        return <boxGeometry args={[1.5, 0.75, 0.8]} />
      case 'chair':
        return <boxGeometry args={[0.6, 0.9, 0.6]} />
      case 'sofa':
        return <boxGeometry args={[2, 0.8, 0.9]} />
      case 'meetingTable':
        return <boxGeometry args={[2.5, 0.75, 1.5]} />
      case 'computer':
        return <boxGeometry args={[0.5, 0.4, 0.4]} />
      case 'bookshelf':
        return <boxGeometry args={[1.2, 2, 0.3]} />
      default:
        return <boxGeometry args={[0.8, 0.8, 0.8]} />
    }
  }
  
  const getAssetColor = (category) => {
    switch(category) {
      case 'Møbler': return '#8b7355'
      case 'IT': return '#4a5568'
      case 'Kjøkken': return '#718096'
      case 'Kontor': return '#2d3748'
      default: return '#cbd5e0'
    }
  }
  
  return (
    <mesh
      position={asset.position || [0, 0, 0]}
      rotation={asset.rotation || [0, 0, 0]}
      scale={asset.scale || [1, 1, 1]}
      castShadow
    >
      {getAssetGeometry(asset.type)}
      <meshStandardMaterial 
        color={getAssetColor(asset.category)}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  )
}

/**
 * Get default walls for a room if not defined
 */
const getDefaultWalls = (room) => {
  const size = 5
  return [
    { start: [-size, 0, -size], end: [size, 0, -size] },
    { start: [size, 0, -size], end: [size, 0, size] },
    { start: [size, 0, size], end: [-size, 0, size] },
    { start: [-size, 0, size], end: [-size, 0, -size] }
  ]
}

/**
 * Building View 3D - Main component
 */
const BuildingView3D = ({ 
  building, 
  onRoomSelect,
  selectedRoom,
  viewSettings = {}
}) => {
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [viewMode, setViewMode] = useState('all') // all, floor, exploded
  const [showGrid, setShowGrid] = useState(true)
  const [showAssets, setShowAssets] = useState(true)
  const [explodeFactor, setExplodeFactor] = useState(0)
  const controlsRef = useRef()
  
  const {
    floorHeight = 3,
    enableShadows = true,
    enableEnvironment = true
  } = viewSettings
  
  // Group rooms by floor
  const getRoomsByFloor = (floorId) => {
    return building.rooms.filter(room => {
      const floorRoom = building.floors
        .find(f => f.id === floorId)
        ?.rooms.find(r => r.id === room.id)
      return floorRoom
    })
  }
  
  // Handle view mode changes
  useEffect(() => {
    if (viewMode === 'exploded') {
      setExplodeFactor(2)
    } else {
      setExplodeFactor(0)
    }
  }, [viewMode])
  
  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow-lg p-4 w-64">
        <h3 className="font-semibold mb-3">Bygningsvisning</h3>
        
        <div className="space-y-3">
          {/* View Mode */}
          <div>
            <label className="text-sm font-medium text-gray-700">Visningsmodus</label>
            <div className="mt-1 grid grid-cols-3 gap-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                Alle etasjer
              </button>
              <button
                onClick={() => setViewMode('floor')}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === 'floor' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                Per etasje
              </button>
              <button
                onClick={() => setViewMode('exploded')}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === 'exploded' ? 'bg-blue-500 text-white' : 'bg-gray-100'
                }`}
              >
                Eksplodert
              </button>
            </div>
          </div>
          
          {/* Floor Selection */}
          {viewMode === 'floor' && (
            <div>
              <label className="text-sm font-medium text-gray-700">Velg etasje</label>
              <select
                value={selectedFloor?.id || ''}
                onChange={(e) => setSelectedFloor(
                  building.floors.find(f => f.id === e.target.value)
                )}
                className="mt-1 w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">-- Velg etasje --</option>
                {building.floors.map(floor => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* View Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Vis rutenett</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAssets}
                onChange={(e) => setShowAssets(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Vis eiendeler</span>
            </label>
          </div>
          
          {/* Building Info */}
          <div className="border-t pt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Etasjer:</span>
              <span className="font-medium">{building.floors.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Totalt rom:</span>
              <span className="font-medium">{building.rooms.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Eiendeler:</span>
              <span className="font-medium">
                {building.rooms.reduce((sum, r) => sum + (r.assets?.length || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas 
        shadows={enableShadows} 
        camera={{ 
          position: [30, 25, 30], 
          fov: 50 
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={0.8} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={10}
          maxDistance={100}
        />
        
        {/* Environment */}
        {enableEnvironment && (
          <>
            <Environment preset="city" />
            <Sky sunPosition={[100, 20, 100]} />
          </>
        )}
        
        {/* Grid */}
        {showGrid && (
          <Grid
            args={[50, 50]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#e5e7eb"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9ca3af"
            fadeDistance={50}
            fadeStrength={1}
          />
        )}
        
        {/* Ground */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.01, 0]} 
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#f3f4f6" />
        </mesh>
        
        {/* Render floors based on view mode */}
        {viewMode === 'all' && building.floors.map((floor, index) => (
          <Floor
            key={floor.id}
            floor={floor}
            rooms={getRoomsByFloor(floor.id)}
            floorIndex={index}
            floorHeight={floorHeight}
            showAssets={showAssets}
            onRoomClick={onRoomSelect}
          />
        ))}
        
        {viewMode === 'floor' && selectedFloor && (
          <Floor
            floor={selectedFloor}
            rooms={getRoomsByFloor(selectedFloor.id)}
            floorIndex={0}
            floorHeight={floorHeight}
            showAssets={showAssets}
            onRoomClick={onRoomSelect}
          />
        )}
        
        {viewMode === 'exploded' && building.floors.map((floor, index) => (
          <group key={floor.id} position={[0, index * floorHeight * (1 + explodeFactor), 0]}>
            <Floor
              floor={floor}
              rooms={getRoomsByFloor(floor.id)}
              floorIndex={0}
              floorHeight={floorHeight}
              showAssets={showAssets}
              isTransparent={index > 0}
              onRoomClick={onRoomSelect}
            />
          </group>
        ))}
        
        {/* Contact shadows */}
        {enableShadows && (
          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.4} 
            scale={50} 
            blur={2} 
            far={10}
          />
        )}
      </Canvas>
    </div>
  )
}

export default BuildingView3D
