import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'

/**
 * TransformController - Håndterer transformasjon av 3D-objekter
 * Støtter translate, rotate og scale operasjoner
 */
const TransformController = ({ 
  object, 
  mode = 'translate', 
  onTransform,
  enabled = true,
  showX = true,
  showY = true,
  showZ = true,
  space = 'world',
  size = 1
}) => {
  const transformRef = useRef()
  const { gl, camera, scene } = useThree()

  useEffect(() => {
    if (transformRef.current) {
      const controls = transformRef.current
      
      // Konfigurer hvilke akser som skal vises
      controls.showX = showX
      controls.showY = showY
      controls.showZ = showZ
      
      // Event handlers
      const handleChange = () => {
        if (onTransform && object) {
          onTransform({
            position: object.position.toArray(),
            rotation: object.rotation.toArray(),
            scale: object.scale.toArray(),
            object: object
          })
        }
      }

      controls.addEventListener('change', handleChange)
      
      return () => {
        controls.removeEventListener('change', handleChange)
      }
    }
  }, [object, onTransform, showX, showY, showZ])

  if (!object || !enabled) return null

  return (
    <TransformControls
      ref={transformRef}
      object={object}
      mode={mode}
      enabled={enabled}
      space={space}
      size={size}
      translationSnap={0.25} // Snap til 0.25 enheter ved flytting
      rotationSnap={Math.PI / 12} // Snap til 15 grader ved rotasjon
      scaleSnap={0.1} // Snap til 0.1 enheter ved skalering
    />
  )
}

export default TransformController
