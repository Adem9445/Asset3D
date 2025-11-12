import { useRef } from 'react'
import { Box } from '@react-three/drei'

const Asset3D = ({ asset }) => {
  const meshRef = useRef()

  const getAssetComponent = () => {
    switch (asset.type) {
      case 'sofa':
        return (
          <group position={asset.position} rotation={asset.rotation} scale={asset.scale}>
            <Box args={[2, 0.4, 0.8]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#3b82f6" />
            </Box>
            <Box args={[2, 0.5, 0.15]} position={[0, 0.65, -0.325]}>
              <meshStandardMaterial color="#3b82f6" />
            </Box>
            <Box args={[0.15, 0.3, 0.8]} position={[-0.925, 0.55, 0]}>
              <meshStandardMaterial color="#3b82f6" />
            </Box>
            <Box args={[0.15, 0.3, 0.8]} position={[0.925, 0.55, 0]}>
              <meshStandardMaterial color="#3b82f6" />
            </Box>
          </group>
        )
      
      case 'desk':
        return (
          <group position={asset.position} rotation={asset.rotation} scale={asset.scale}>
            <Box args={[1.6, 0.05, 0.8]} position={[0, 0.75, 0]}>
              <meshStandardMaterial color="#8b7355" />
            </Box>
            <Box args={[0.05, 0.75, 0.05]} position={[-0.75, 0.375, -0.35]}>
              <meshStandardMaterial color="#6b5945" />
            </Box>
            <Box args={[0.05, 0.75, 0.05]} position={[0.75, 0.375, -0.35]}>
              <meshStandardMaterial color="#6b5945" />
            </Box>
            <Box args={[0.05, 0.75, 0.05]} position={[-0.75, 0.375, 0.35]}>
              <meshStandardMaterial color="#6b5945" />
            </Box>
            <Box args={[0.05, 0.75, 0.05]} position={[0.75, 0.375, 0.35]}>
              <meshStandardMaterial color="#6b5945" />
            </Box>
          </group>
        )
      
      case 'chair':
        return (
          <group position={asset.position} rotation={asset.rotation} scale={asset.scale}>
            <Box args={[0.5, 0.05, 0.5]} position={[0, 0.45, 0]}>
              <meshStandardMaterial color="#374151" />
            </Box>
            <Box args={[0.05, 0.45, 0.05]} position={[-0.2, 0.225, -0.2]}>
              <meshStandardMaterial color="#1f2937" />
            </Box>
            <Box args={[0.05, 0.45, 0.05]} position={[0.2, 0.225, -0.2]}>
              <meshStandardMaterial color="#1f2937" />
            </Box>
            <Box args={[0.05, 0.45, 0.05]} position={[-0.2, 0.225, 0.2]}>
              <meshStandardMaterial color="#1f2937" />
            </Box>
            <Box args={[0.05, 0.45, 0.05]} position={[0.2, 0.225, 0.2]}>
              <meshStandardMaterial color="#1f2937" />
            </Box>
            <Box args={[0.5, 0.6, 0.05]} position={[0, 0.75, -0.225]}>
              <meshStandardMaterial color="#374151" />
            </Box>
          </group>
        )
      
      case 'computer':
      case 'monitor':
        return (
          <group position={asset.position} rotation={asset.rotation} scale={asset.scale}>
            <Box args={[0.5, 0.35, 0.02]} position={[0, 0.175, 0]}>
              <meshStandardMaterial color="#1f2937" />
            </Box>
            <Box args={[0.1, 0.15, 0.1]} position={[0, -0.075, 0]}>
              <meshStandardMaterial color="#374151" />
            </Box>
            <Box args={[0.3, 0.02, 0.2]} position={[0, -0.16, 0]}>
              <meshStandardMaterial color="#374151" />
            </Box>
          </group>
        )
      
      case 'printer':
        return (
          <group position={asset.position} rotation={asset.rotation} scale={asset.scale}>
            <Box args={[0.4, 0.3, 0.5]} position={[0, 0.15, 0]}>
              <meshStandardMaterial color="#e5e7eb" />
            </Box>
            <Box args={[0.35, 0.02, 0.3]} position={[0, 0.31, 0.05]}>
              <meshStandardMaterial color="#9ca3af" />
            </Box>
          </group>
        )
      
      case 'coffee_machine':
        return (
          <group position={asset.position} rotation={asset.rotation} scale={asset.scale}>
            <Box args={[0.3, 0.4, 0.25]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#374151" />
            </Box>
            <Box args={[0.1, 0.05, 0.1]} position={[0, 0.425, 0.1]}>
              <meshStandardMaterial color="#ef4444" />
            </Box>
          </group>
        )
      
      default:
        return (
          <Box 
            ref={meshRef}
            args={[0.5, 0.5, 0.5]} 
            position={asset.position || [0, 0.25, 0]}
            rotation={asset.rotation || [0, 0, 0]}
            scale={asset.scale || [1, 1, 1]}
          >
            <meshStandardMaterial color="#9ca3af" />
          </Box>
        )
    }
  }

  return getAssetComponent()
}

export default Asset3D
