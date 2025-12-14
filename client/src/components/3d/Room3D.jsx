import { useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import Asset3D from './Asset3D'

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

export default Room3D
