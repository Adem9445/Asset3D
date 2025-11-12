import React, { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Simple drag component for 3D objects
 */
const SimpleDrag = ({ children, enabled = true, onDragEnd, snapToGrid = true, gridSize = 0.25, bounds = null }) => {
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
    
    if (raycaster.ray.intersectPlane(plane, intersection)) {
      const newPos = intersection.sub(offset)
      
      // Apply grid snapping
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
      meshRef.current.position.z = newPos.z
    }
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
      onPointerDown={handlePointerDown}
      onPointerOver={() => enabled && (document.body.style.cursor = 'grab')}
      onPointerOut={() => !isDragging && (document.body.style.cursor = 'auto')}
    >
      {children}
    </mesh>
  )
}

export default SimpleDrag
