import { useState, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  Grid, 
  Environment, 
  PerspectiveCamera,
  Stats,
  ContactShadows,
  Text,
  Html
} from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

// Import kontroller
import TransformController from './controls/TransformController'
import DragController from './controls/DragController'
import DragDropManager, { DropZone } from './DragDropManager'
import SimpleDrag from './SimpleDrag'

// Import assets
import { DeskAsset, OfficeChairAsset, SofaAsset, BookshelfAsset, MeetingTableAsset } from './assets/FurnitureAssets'
import { ComputerAsset, PrinterAsset, PhoneAsset, WhiteboardAsset, FilingCabinetAsset, TrashBinAsset } from './assets/OfficeAssets'
import { CoffeeMachineAsset, MicrowaveAsset, RefrigeratorAsset, WaterCoolerAsset, PlantAsset } from './assets/KitchenAssets'
import { DishwasherAsset, WashingMachineAsset, DryerAsset, FreezerAsset, StoveAsset, VentilatorAsset } from './assets/ApplianceAssets'

/**
 * Hovedkomponent for 3D rom-editor
 */
const RoomEditor3D = ({ 
  roomData, 
  assets = [], 
  onAssetUpdate, 
  onAssetDelete,
  selectedAssetId,
  onSelectAsset,
  editMode = 'view',
  showGrid = true,
  showStats = false 
}) => {
  const [transformMode, setTransformMode] = useState('translate')
  const [selectedObject, setSelectedObject] = useState(null)
  const [hoveredAsset, setHoveredAsset] = useState(null)
  const sceneRef = useRef()

  // Asset komponent mapper
  const AssetComponents = {
    desk: DeskAsset,
    chair: OfficeChairAsset,
    sofa: SofaAsset,
    bookshelf: BookshelfAsset,
    meetingTable: MeetingTableAsset,
    computer: ComputerAsset,
    printer: PrinterAsset,
    phone: PhoneAsset,
    whiteboard: WhiteboardAsset,
    filingCabinet: FilingCabinetAsset,
    trashBin: TrashBinAsset,
    coffeeMachine: CoffeeMachineAsset,
    microwave: MicrowaveAsset,
    refrigerator: RefrigeratorAsset,
    waterCooler: WaterCoolerAsset,
    plant: PlantAsset,
    dishwasher: DishwasherAsset,
    washingMachine: WashingMachineAsset,
    dryer: DryerAsset,
    freezer: FreezerAsset,
    stove: StoveAsset,
    ventilator: VentilatorAsset
  }

  const handleAssetClick = (asset, mesh) => {
    if (editMode === 'edit') {
      setSelectedObject(mesh)
      onSelectAsset?.(asset.id)
    }
  }

  const handleTransform = (transformData) => {
    if (selectedAssetId && onAssetUpdate) {
      onAssetUpdate(selectedAssetId, {
        position: transformData.position,
        rotation: transformData.rotation,
        scale: transformData.scale
      })
    }
  }

  const handleDragEnd = (dragData) => {
    const assetId = dragData.object.userData.assetId
    if (assetId && onAssetUpdate) {
      console.log(`Asset ${assetId} moved to:`, dragData.position)
      onAssetUpdate(assetId, {
        position: dragData.position
      })
    }
  }

  const handleDrag = (dragData) => {
    // Optional: Live update during drag
    const assetId = dragData.object.userData.assetId
    if (assetId) {
      // Visual feedback during drag
      dragData.object.children[0].material.emissive = new THREE.Color(0x444444)
      dragData.object.children[0].material.emissiveIntensity = 0.3
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Kontrollpanel */}
      {editMode === 'edit' && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Transform-modus</h3>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded text-xs ${transformMode === 'translate' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setTransformMode('translate')}
              >
                Flytt
              </button>
              <button
                className={`px-3 py-1 rounded text-xs ${transformMode === 'rotate' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setTransformMode('rotate')}
              >
                Roter
              </button>
              <button
                className={`px-3 py-1 rounded text-xs ${transformMode === 'scale' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setTransformMode('scale')}
              >
                Skaler
              </button>
            </div>
          </div>

          {selectedAssetId && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600 mb-2">Valgt objekt: {selectedAssetId}</p>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                onClick={() => {
                  onAssetDelete?.(selectedAssetId)
                  setSelectedObject(null)
                }}
              >
                Slett objekt
              </button>
            </div>
          )}
        </div>
      )}

      {/* Asset info overlay */}
      {hoveredAsset && (
        <div className="absolute top-4 right-4 z-10 bg-black/75 text-white rounded-lg p-3 max-w-xs">
          <p className="text-sm font-semibold">{hoveredAsset.name}</p>
          <p className="text-xs opacity-80">{hoveredAsset.category}</p>
          {hoveredAsset.metadata?.purchaseDate && (
            <p className="text-xs opacity-80">Kjøpt: {hoveredAsset.metadata.purchaseDate}</p>
          )}
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas shadows>
        <Suspense fallback={null}>
          {/* Kamera */}
          <PerspectiveCamera
            makeDefault
            position={[10, 8, 10]}
            fov={60}
            near={0.1}
            far={1000}
          />

          {/* Kontroller */}
          <OrbitControls
            ref={(controls) => { 
              window.orbitControls = controls
              console.log('OrbitControls initialized')
            }}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2}
            maxDistance={20}
            target={[0, 0, 0]}
            makeDefault
          />

          {/* Lyssetting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffcc77" />

          {/* Miljø */}
          <Environment preset="studio" background={false} />

          {/* Grid */}
          {showGrid && (
            <Grid
              args={[20, 20]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#e5e7eb"
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#9ca3af"
              fadeDistance={30}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={false}
            />
          )}

          {/* Gulv */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#f3f4f6" />
          </mesh>

          {/* Kontaktskygger */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={20}
            blur={1.5}
            far={4.5}
          />

          {/* Rom vegger */}
          {roomData && (
            <group name="room-walls">
              {/* Bakvegg */}
              <mesh position={[0, 2.5, -roomData.depth/2]} castShadow receiveShadow>
                <boxGeometry args={[roomData.width, 5, 0.2]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              
              {/* Sidevegger */}
              <mesh position={[-roomData.width/2, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 5, roomData.depth]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[roomData.width/2, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, 5, roomData.depth]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>

              {/* Rom navn */}
              <Text
                position={[0, 4, -roomData.depth/2 + 0.15]}
                fontSize={0.5}
                color="#1f2937"
                anchorX="center"
                anchorY="middle"
              >
                {roomData.name}
              </Text>
            </group>
          )}

          {/* Assets med fysikk */}
          <Physics gravity={[0, -9.81, 0]} debug={false}>
            {assets.map((asset, index) => {
              const AssetComponent = AssetComponents[asset.type]
              if (!AssetComponent) return null

              // Generate default non-overlapping positions if not set
              const getDefaultPosition = (idx) => {
                const gridX = 2 // spacing between assets
                const gridZ = 2
                const itemsPerRow = 5
                const row = Math.floor(idx / itemsPerRow)
                const col = idx % itemsPerRow
                return [
                  (col - Math.floor(itemsPerRow / 2)) * gridX,
                  0,
                  (row - 1) * gridZ
                ]
              }

              const position = asset.position && asset.position.length === 3 
                ? asset.position 
                : getDefaultPosition(index)

              const isEditEnabled = editMode === 'move' || editMode === 'edit'
              
              // Ensure room bounds for drag constraints
              const roomBounds = roomData ? {
                minX: -roomData.width/2 + 1,
                maxX: roomData.width/2 - 1,
                minZ: -roomData.depth/2 + 1,
                maxZ: roomData.depth/2 - 1
              } : null
              
              return (
                <group key={asset.id} position={position}>
                  <SimpleDrag
                    enabled={isEditEnabled}
                    snapToGrid={true}
                    gridSize={0.25}
                    bounds={roomBounds}
                    onDragEnd={(newPosition) => {
                      console.log(`Asset ${asset.id} moved to:`, newPosition)
                      if (onAssetUpdate) {
                        onAssetUpdate(asset.id, { position: newPosition })
                      }
                    }}
                  >
                    <group
                      userData={{ assetId: asset.id, isAsset: true }}
                      onPointerOver={() => setHoveredAsset(asset)}
                      onPointerOut={() => setHoveredAsset(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAssetClick(asset, e.object)
                      }}
                    >
                      <AssetComponent
                        position={[0, 0, 0]}
                        rotation={asset.rotation || [0, 0, 0]}
                        scale={asset.scale || [1, 1, 1]}
                        color={asset.color}
                        selected={asset.id === selectedAssetId}
                      />
                      {hoveredAsset?.id === asset.id && (
                        <Html position={[0, 1, 0]}>
                          <div className="bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                            {asset.name}
                          </div>
                        </Html>
                      )}
                    </group>
                  </SimpleDrag>
                </group>
              )
            })}
          </Physics>

          {/* Transform controller for valgt objekt */}
          {editMode === 'edit' && selectedObject && (
            <TransformController
              object={selectedObject}
              mode={transformMode}
              onTransform={handleTransform}
              showY={transformMode !== 'translate'} // Begrens Y-akse for translate
              size={0.5}
            />
          )}

          {/* Performance stats */}
          {showStats && <Stats />}
        </Suspense>
      </Canvas>
    </div>
  )
}

export default RoomEditor3D
