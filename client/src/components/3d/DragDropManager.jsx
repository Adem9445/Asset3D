import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Manager for handling HTML5 Drag & Drop into the 3D scene
 */
const DragDropManager = ({ children, onDrop }) => {
  const { gl, camera, scene } = useThree()

  useEffect(() => {
    const canvas = gl.domElement

    const handleDragOver = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }

    const handleDrop = (e) => {
      e.preventDefault()

      try {
        const itemData = JSON.parse(e.dataTransfer.getData('application/json'))

        // Calculate drop position in 3D space
        const rect = canvas.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

        // Check for intersection with existing objects
        const intersects = raycaster.intersectObjects(scene.children, true)

        // Find the first intersection that is an asset (excluding the floor/walls if they aren't marked as assets)
        // We look for objects that have userData.isAsset in their parent group
        const hit = intersects.find(intersect => {
          let current = intersect.object
          while (current) {
            if (current.userData?.isAsset) return true
            current = current.parent
          }
          return false
        })

        let dropPosition = [0, 0, 0]

        if (hit) {
          // If we hit an object, place on top of it
          dropPosition = [hit.point.x, hit.point.y, hit.point.z]
        } else {
          // Fallback to floor
          const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
          const target = new THREE.Vector3()
          raycaster.ray.intersectPlane(plane, target)
          dropPosition = [target.x, 0, target.z]
        }

        if (onDrop) {
          onDrop(itemData, dropPosition)
        }
      } catch (err) {
        console.error('Error parsing drop data:', err)
      }
    }

    canvas.addEventListener('dragover', handleDragOver)
    canvas.addEventListener('drop', handleDrop)

    return () => {
      canvas.removeEventListener('dragover', handleDragOver)
      canvas.removeEventListener('drop', handleDrop)
    }
  }, [gl, camera, onDrop])

  return <>{children}</>
}

export const DropZone = () => null // Deprecated, logic moved to manager

export default DragDropManager
