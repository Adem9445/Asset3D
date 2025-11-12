import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * DragController - Implementerer dra-og-slipp funksjonalitet for 3D-objekter
 * Håndterer kollisjon og snapping til grid
 */
const DragController = ({ 
  children, 
  onDragStart, 
  onDragEnd, 
  onDrag,
  enabled = true,
  dragPlane = 'xz', // 'xy', 'xz', 'yz'
  snapToGrid = false,
  gridSize = 0.5,
  bounds = null, // { min: [x,y,z], max: [x,y,z] }
  checkCollisions = false
}) => {
  const meshRef = useRef()
  const { camera, gl, scene } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset] = useState(new THREE.Vector3())
  const [worldPosition] = useState(new THREE.Vector3())
  const [startPosition] = useState(new THREE.Vector3())
  
  // Raycaster for drag detection
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const plane = useRef(new THREE.Plane())

  useEffect(() => {
    if (!meshRef.current || !enabled) return

    const mesh = meshRef.current

    // Sett opp drag plane basert på orientering
    switch (dragPlane) {
      case 'xy':
        plane.current.normal.set(0, 0, 1)
        break
      case 'yz':
        plane.current.normal.set(1, 0, 0)
        break
      case 'xz':
      default:
        plane.current.normal.set(0, 1, 0)
        break
    }

    const handlePointerDown = (event) => {
      event.stopPropagation()
      
      // Beregn museposisjon
      const rect = gl.domElement.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      // Sjekk om vi traff objektet
      raycaster.current.setFromCamera(mouse.current, camera)
      const intersects = raycaster.current.intersectObject(mesh, true)
      
      if (intersects.length > 0) {
        setIsDragging(true)
        
        // Lagre startposisjon
        mesh.getWorldPosition(worldPosition)
        startPosition.copy(worldPosition)
        
        // Beregn offset mellom musepeker og objektsenter
        plane.current.setFromNormalAndCoplanarPoint(
          plane.current.normal,
          worldPosition
        )
        
        const intersection = new THREE.Vector3()
        raycaster.current.ray.intersectPlane(plane.current, intersection)
        dragOffset.subVectors(worldPosition, intersection)
        
        if (onDragStart) {
          onDragStart({
            object: mesh,
            position: worldPosition.toArray(),
            event
          })
        }
        
        // Sett cursor stil
        gl.domElement.style.cursor = 'grabbing'
        
        // Disable OrbitControls during drag
        if (window.orbitControls) {
          window.orbitControls.enabled = false
        }
      }
    }

    const handlePointerMove = (event) => {
      if (!isDragging) return
      
      // Oppdater museposisjon
      const rect = gl.domElement.getBoundingClientRect()
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      // Beregn ny posisjon
      raycaster.current.setFromCamera(mouse.current, camera)
      const intersection = new THREE.Vector3()
      
      if (raycaster.current.ray.intersectPlane(plane.current, intersection)) {
        const newPosition = intersection.add(dragOffset)
        
        // Snap til grid hvis aktivert
        if (snapToGrid) {
          newPosition.x = Math.round(newPosition.x / gridSize) * gridSize
          newPosition.y = Math.round(newPosition.y / gridSize) * gridSize
          newPosition.z = Math.round(newPosition.z / gridSize) * gridSize
        }
        
        // Sjekk bounds hvis definert
        if (bounds) {
          newPosition.x = Math.max(bounds.min[0], Math.min(bounds.max[0], newPosition.x))
          newPosition.y = Math.max(bounds.min[1], Math.min(bounds.max[1], newPosition.y))
          newPosition.z = Math.max(bounds.min[2], Math.min(bounds.max[2], newPosition.z))
        }
        
        // Sjekk kollisjoner hvis aktivert
        if (checkCollisions) {
          const canMove = checkCollisionWithOtherObjects(mesh, newPosition)
          if (!canMove) return
        }
        
        // Oppdater posisjon
        mesh.position.copy(newPosition)
        
        if (onDrag) {
          onDrag({
            object: mesh,
            position: newPosition.toArray(),
            event
          })
        }
      }
    }

    const handlePointerUp = (event) => {
      if (isDragging) {
        setIsDragging(false)
        
        mesh.getWorldPosition(worldPosition)
        
        if (onDragEnd) {
          onDragEnd({
            object: mesh,
            position: worldPosition.toArray(),
            startPosition: startPosition.toArray(),
            event
          })
        }
        
        // Reset cursor
        gl.domElement.style.cursor = 'grab'
        
        // Re-enable OrbitControls
        if (window.orbitControls) {
          window.orbitControls.enabled = true
        }
      }
    }

    // Kollisjonsdetektor
    const checkCollisionWithOtherObjects = (draggedMesh, newPosition) => {
      // Opprett en midlertidig bounding box for ny posisjon
      const tempBox = new THREE.Box3()
      const tempMesh = draggedMesh.clone()
      tempMesh.position.copy(newPosition)
      tempBox.setFromObject(tempMesh)
      
      // Sjekk kollisjon med andre objekter i scenen
      let canMove = true
      scene.traverse((child) => {
        if (child !== draggedMesh && child.isMesh && child.userData.isAsset) {
          const childBox = new THREE.Box3().setFromObject(child)
          if (tempBox.intersectsBox(childBox)) {
            canMove = false
          }
        }
      })
      
      return canMove
    }

    // Hover effekt
    const handlePointerOver = () => {
      if (!isDragging) {
        gl.domElement.style.cursor = 'grab'
      }
    }

    const handlePointerOut = () => {
      if (!isDragging) {
        gl.domElement.style.cursor = 'auto'
      }
    }

    // Legg til event listeners
    mesh.addEventListener('pointerdown', handlePointerDown)
    mesh.addEventListener('pointerover', handlePointerOver)
    mesh.addEventListener('pointerout', handlePointerOut)
    
    // Global listeners for drag
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    
    return () => {
      mesh.removeEventListener('pointerdown', handlePointerDown)
      mesh.removeEventListener('pointerover', handlePointerOver)
      mesh.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      gl.domElement.style.cursor = 'auto'
    }
  }, [enabled, isDragging, dragPlane, snapToGrid, gridSize, bounds, checkCollisions, camera, gl, scene])

  return (
    <group ref={meshRef}>
      {children}
    </group>
  )
}

export default DragController
