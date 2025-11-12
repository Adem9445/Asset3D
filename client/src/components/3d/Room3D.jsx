import { useRef, useState } from 'react'
import { Box, Text } from '@react-three/drei'
import * as THREE from 'three'

const Room3D = ({ room, isSelected, onClick }) => {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  const { width, depth, height, position, name } = room
  const wallThickness = 0.1
  
  // Farger
  const floorColor = '#e0e0e0'
  const wallColor = isSelected ? '#bfdbfe' : '#ffffff'
  const highlightColor = '#60a5fa'
  
  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Gulv */}
      <mesh 
        position={[0, 0, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial 
          color={floorColor} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Vegger */}
      {/* Bakvegg */}
      <mesh position={[0, height/2, -depth/2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial 
          color={hovered ? highlightColor : wallColor}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
      
      {/* Frontvegg med åpning */}
      <mesh position={[0, height/2, depth/2]} castShadow receiveShadow>
        <boxGeometry args={[width, height, wallThickness]} />
        <meshStandardMaterial 
          color={hovered ? highlightColor : wallColor}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
      
      {/* Venstre vegg */}
      <mesh position={[-width/2, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial 
          color={hovered ? highlightColor : wallColor}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
      
      {/* Høyre vegg */}
      <mesh position={[width/2, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial 
          color={hovered ? highlightColor : wallColor}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
      
      {/* Rom navn */}
      {isSelected && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.5}
          color="#1e40af"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      )}
      
      {/* Utvalgsindikator */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width, 0.01, depth)]} />
          <lineBasicMaterial color="#2563eb" linewidth={2} />
        </lineSegments>
      )}
      
      {/* Render eiendeler i rommet */}
      {room.assets?.map((asset) => (
        <Asset3D key={asset.id} asset={asset} />
      ))}
    </group>
  )
}

const Asset3D = ({ asset }) => {
  const getAssetGeometry = () => {
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
      default:
        return (
          <Box args={[0.5, 0.5, 0.5]} position={asset.position}>
            <meshStandardMaterial color="#9ca3af" />
          </Box>
        )
    }
  }
  
  return getAssetGeometry()
}

export default Room3D
