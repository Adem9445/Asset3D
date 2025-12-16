import React, { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Simple drag component for 3D objects
 */
const SimpleDrag = ({ children, enabled = true, onDragEnd, snapToGrid = true, gridSize = 0.25, bounds = null, position = [0, 0, 0] }) => {
  const meshRef = useRef()
  const { camera, gl, scene } = useThree()
  const [isDragging, setIsDragging] = useState(false)

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const intersection = new THREE.Vector3()
  const offset = new THREE.Vector3()
  const startPos = new THREE.Vector3()

  const handlePointerDown = (e) => {
    if (!enabled) return
    e.stopPropagation()

    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    if (meshRef.current) {
      meshRef.current.getWorldPosition(startPos)
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), startPos)

      if (raycaster.ray.intersectPlane(plane, intersection)) {
        offset.copy(intersection).sub(startPos)
        setIsDragging(true)

        // Disable orbit controls
        if (window.orbitControls) {
          window.orbitControls.enabled = false
        }

        document.body.style.cursor = 'grabbing'
      }
    }
  }

  const handlePointerMove = (e) => {
    if (!isDragging || !meshRef.current) return

    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    // Raycast against all objects to find potential supports
    const intersects = raycaster.intersectObjects(scene.children, true)

    // Find first hit that is not the dragged object itself
    const hit = intersects.find(intersect => {
      let current = intersect.object
      // Check if this object belongs to the dragged mesh
      let isSelf = false
      while (current) {
        if (current === meshRef.current) {
          isSelf = true
          break
        }
        current = current.parent
      }
      if (isSelf) return false

      // Check if it's an asset or floor/wall
      // We want to stack on assets, or fallback to floor
      current = intersect.object
      while (current) {
        if (current.userData?.isAsset) return true
        current = current.parent
      }
      return false
    })

    let newPos = new THREE.Vector3()

    if (hit) {
      // Stack on top of the hit object
      newPos.copy(hit.point)
    } else {
      // Fallback to floor plane
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        newPos.copy(intersection).sub(offset)
        // Force Y to 0 for floor drag
        newPos.y = 0
      }
    }

    // Apply grid snapping (only to X and Z, keep Y from stacking)
    if (snapToGrid) {
      newPos.x = Math.round(newPos.x / gridSize) * gridSize
      newPos.z = Math.round(newPos.z / gridSize) * gridSize
    }

    // Apply bounds constraints if provided
    if (bounds) {
      if (bounds.minX !== undefined) newPos.x = Math.max(bounds.minX, newPos.x)
      if (bounds.maxX !== undefined) newPos.x = Math.min(bounds.maxX, newPos.x)
      if (bounds.minZ !== undefined) newPos.z = Math.max(bounds.minZ, newPos.z)
      if (bounds.maxZ !== undefined) newPos.z = Math.min(bounds.maxZ, newPos.z)
    }

    meshRef.current.position.x = newPos.x
    meshRef.current.position.y = newPos.y
    meshRef.current.position.z = newPos.z
  }

  const handlePointerUp = () => {
    if (isDragging && meshRef.current) {
      const finalPos = [
        meshRef.current.position.x,
        meshRef.current.position.y,
        meshRef.current.position.z
      ]

      if (onDragEnd) {
        onDragEnd(finalPos)
      }

      // Re-enable orbit controls
      if (window.orbitControls) {
        window.orbitControls.enabled = true
      }

      document.body.style.cursor = 'auto'
      setIsDragging(false)
    }
  }

  // Add global listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [isDragging])

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerOver={() => enabled && (document.body.style.cursor = 'grab')}
      onPointerOut={() => !isDragging && (document.body.style.cursor = 'auto')}
    >
      {children}
    </mesh>
  )
}

export default SimpleDrag
