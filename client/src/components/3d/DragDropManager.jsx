import { useRef, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useDrag } from '@use-gesture/react'
import * as THREE from 'three'

/**
 * Profesjonell Drag & Drop Manager for 3D objekter
 */
const DragDropManager = ({ 
  children, 
  onDragStart,
  onDrag,
  onDragEnd,
  onDrop,
  enabled = true,
  constraints = null,
  snapToGrid = false,
  gridSize = 0.5,
  showGhost = true,
  checkCollisions = true,
  highlightDropZone = true
}) => {
  const meshRef = useRef()
  const ghostRef = useRef()
  const { camera, scene, raycaster, gl } = useThree()
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState([0, 0, 0])
  const [validDrop, setValidDrop] = useState(true)
  const [dropZone, setDropZone] = useState(null)
  const [collisions, setCollisions] = useState([])
  
  // Drag plane for bedre kontroll
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const intersection = useRef(new THREE.Vector3())
  
  // Snap til grid
  const snapValue = (value) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }
  
  // Sjekk kollisjoner
  const checkForCollisions = (position) => {
    if (!checkCollisions || !meshRef.current) return []
    
    const box = new THREE.Box3().setFromObject(meshRef.current)
    const testBox = box.clone().translate(
      new THREE.Vector3(
        position[0] - meshRef.current.position.x,
        position[1] - meshRef.current.position.y,
        position[2] - meshRef.current.position.z
      )
    )
    
    const collided = []
    scene.traverse((child) => {
      if (
        child !== meshRef.current && 
        child.userData?.isAsset && 
        child.type === 'Mesh'
      ) {
        const childBox = new THREE.Box3().setFromObject(child)
        if (testBox.intersectsBox(childBox)) {
          collided.push(child)
        }
      }
    })
    
    return collided
  }
  
  // Finn drop zone
  const findDropZone = (point) => {
    if (!highlightDropZone) return null
    
    // Sjekk om vi er over en gyldig drop zone
    const zones = scene.children.filter(child => 
      child.userData?.isDropZone
    )
    
    for (const zone of zones) {
      const box = new THREE.Box3().setFromObject(zone)
      if (box.containsPoint(point)) {
        return zone
      }
    }
    
    return null
  }
  
  // Oppdater drag posisjon
  const updateDragPosition = (event) => {
    if (!isDragging || !meshRef.current) return
    
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
    
    if (raycaster.ray.intersectPlane(dragPlane.current, intersection.current)) {
      let newPos = [
        snapValue(intersection.current.x - dragOffset.current.x),
        meshRef.current.position.y, // Hold Y konstant
        snapValue(intersection.current.z - dragOffset.current.z)
      ]
      
      // Sjekk constraints
      if (constraints) {
        newPos[0] = Math.max(constraints.minX || -Infinity, 
                    Math.min(constraints.maxX || Infinity, newPos[0]))
        newPos[2] = Math.max(constraints.minZ || -Infinity, 
                    Math.min(constraints.maxZ || Infinity, newPos[2]))
      }
      
      // Sjekk kollisjoner
      const cols = checkForCollisions(newPos)
      setCollisions(cols)
      setValidDrop(cols.length === 0)
      
      // Finn drop zone
      const zone = findDropZone(new THREE.Vector3(...newPos))
      setDropZone(zone)
      
      // Oppdater posisjon
      setDragPosition(newPos)
      meshRef.current.position.set(...newPos)
      
      // Oppdater ghost
      if (showGhost && ghostRef.current) {
        ghostRef.current.position.set(...newPos)
        ghostRef.current.material.color = validDrop 
          ? new THREE.Color(0x00ff00)
          : new THREE.Color(0xff0000)
        ghostRef.current.material.opacity = 0.5
      }
      
      // Callback
      onDrag?.({
        position: newPos,
        validDrop,
        collisions: cols,
        dropZone: zone
      })
    }
  }
  
  // Gesture binding
  const bind = useDrag(
    ({ 
      first, 
      last, 
      event,
      xy: [x, y],
      movement: [mx, my],
      memo 
    }) => {
      if (!enabled || !meshRef.current) return
      
      event.stopPropagation()
      
      if (first) {
        // Start drag
        setIsDragging(true)
        
        // Beregn offset
        const rect = gl.domElement.getBoundingClientRect()
        const mouseX = ((x - rect.left) / rect.width) * 2 - 1
        const mouseY = -((y - rect.top) / rect.height) * 2 + 1
        
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera)
        
        const intersects = raycaster.intersectObject(meshRef.current, true)
        if (intersects.length > 0) {
          const point = intersects[0].point
          dragOffset.current.copy(point).sub(meshRef.current.position)
          
          // Sett drag plane på objektets høyde
          dragPlane.current.setFromNormalAndCoplanarPoint(
            new THREE.Vector3(0, 1, 0),
            point
          )
        }
        
        // Lag ghost
        if (showGhost && !ghostRef.current) {
          const ghost = meshRef.current.clone()
          ghost.material = meshRef.current.material.clone()
          ghost.material.transparent = true
          ghost.material.opacity = 0.5
          ghost.userData.isGhost = true
          ghostRef.current = ghost
          scene.add(ghost)
        }
        
        onDragStart?.({
          object: meshRef.current,
          position: [
            meshRef.current.position.x,
            meshRef.current.position.y,
            meshRef.current.position.z
          ]
        })
        
        return [meshRef.current.position.x, meshRef.current.position.z]
      }
      
      if (last) {
        // Slutt drag
        setIsDragging(false)
        
        // Fjern ghost
        if (ghostRef.current) {
          scene.remove(ghostRef.current)
          ghostRef.current = null
        }
        
        // Drop handling
        if (validDrop) {
          onDrop?.({
            object: meshRef.current,
            position: dragPosition,
            dropZone: dropZone
          })
        } else {
          // Snap tilbake hvis ugyldig drop
          if (memo) {
            meshRef.current.position.x = memo[0]
            meshRef.current.position.z = memo[1]
          }
        }
        
        onDragEnd?.({
          object: meshRef.current,
          position: validDrop ? dragPosition : memo,
          validDrop,
          dropZone
        })
        
        // Reset
        setCollisions([])
        setDropZone(null)
        setValidDrop(true)
        
        return
      }
      
      // Under dragging
      updateDragPosition(event)
      
      return memo
    },
    { 
      filterTaps: true,
      pointer: { touch: true }
    }
  )
  
  // Visuell feedback
  useFrame(() => {
    if (isDragging && meshRef.current) {
      // Animer objektet under drag
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.05
      
      // Highlight kollisjoner
      collisions.forEach(obj => {
        if (obj.material?.emissive) {
          obj.material.emissive = new THREE.Color(0xff0000)
          obj.material.emissiveIntensity = 0.2
        }
      })
    }
  })
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (ghostRef.current) {
        scene.remove(ghostRef.current)
      }
      // Reset kollisjon highlights
      scene.traverse((child) => {
        if (child.material?.emissive) {
          child.material.emissiveIntensity = 0
        }
      })
    }
  }, [scene])
  
  return (
    <group 
      ref={meshRef} 
      {...bind()}
      onPointerOver={(e) => {
        if (enabled && !isDragging) {
          document.body.style.cursor = 'grab'
          e.stopPropagation()
        }
      }}
      onPointerOut={(e) => {
        if (!isDragging) {
          document.body.style.cursor = 'auto'
          e.stopPropagation()
        }
      }}
    >
      {children}
    </group>
  )
}

/**
 * Drop Zone komponent
 */
export const DropZone = ({ 
  position = [0, 0, 0], 
  size = [5, 0.1, 5],
  color = '#00ff00',
  visible = false,
  onDrop
}) => {
  const [isActive, setIsActive] = useState(false)
  
  return (
    <mesh 
      position={position}
      userData={{ 
        isDropZone: true,
        onDrop
      }}
      visible={visible || isActive}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial 
        color={isActive ? '#ffff00' : color}
        transparent
        opacity={0.3}
      />
    </mesh>
  )
}

export default DragDropManager
