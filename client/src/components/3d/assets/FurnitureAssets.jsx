import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Moderne kontorpult med detaljer
 */
export const DeskAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#8B4513', selected = false }) => {
  const groupRef = useRef()
  
  useFrame(() => {
    if (selected && groupRef.current) {
      groupRef.current.children.forEach(child => {
        if (child.material) {
          child.material.emissive = new THREE.Color(0x444444)
          child.material.emissiveIntensity = 0.2
        }
      })
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'desk' }}>
      {/* Bordplate */}
      <RoundedBox args={[1.8, 0.05, 0.9]} radius={0.02} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Bein */}
      <Box args={[0.05, 0.7, 0.05]} position={[-0.85, 0.35, -0.4]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.05, 0.7, 0.05]} position={[0.85, 0.35, -0.4]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.05, 0.7, 0.05]} position={[-0.85, 0.35, 0.4]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.05, 0.7, 0.05]} position={[0.85, 0.35, 0.4]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* Skuffeseksjon */}
      <RoundedBox args={[0.4, 0.5, 0.45]} radius={0.01} position={[0.6, 0.25, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Skuffehåndtak */}
      <Box args={[0.2, 0.02, 0.02]} position={[0.4, 0.4, 0.23]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Box>
      <Box args={[0.2, 0.02, 0.02]} position={[0.4, 0.2, 0.23]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Box>
    </group>
  )
}

/**
 * Ergonomisk kontorstol med hjul
 */
export const OfficeChairAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#1a1a1a', selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'chair' }}>
      {/* Sete */}
      <RoundedBox args={[0.5, 0.08, 0.5]} radius={0.05} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Ryggstøtte */}
      <RoundedBox args={[0.5, 0.7, 0.08]} radius={0.05} position={[0, 0.85, -0.21]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Armlener */}
      <Box args={[0.06, 0.15, 0.3]} position={[-0.25, 0.65, 0]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.06, 0.15, 0.3]} position={[0.25, 0.65, 0]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* Sentral søyle */}
      <Cylinder args={[0.03, 0.05, 0.45]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Base med hjul */}
      <group position={[0, 0.02, 0]}>
        {/* 5 hjularmer */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const x = Math.cos(rad) * 0.25
          const z = Math.sin(rad) * 0.25
          return (
            <group key={i}>
              <Box args={[0.03, 0.02, 0.25]} position={[x/2, 0, z/2]} rotation={[0, rad, 0]}>
                <meshStandardMaterial color="#333333" />
              </Box>
              <Sphere args={[0.03]} position={[x, -0.01, z]}>
                <meshStandardMaterial color="#000000" />
              </Sphere>
            </group>
          )
        })}
      </group>
    </group>
  )
}

/**
 * Moderne sofa med puter
 */
export const SofaAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#2563eb', selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'sofa' }}>
      {/* Base/sete */}
      <RoundedBox args={[2.2, 0.4, 0.9]} radius={0.05} position={[0, 0.2, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Ryggstøtte */}
      <RoundedBox args={[2.2, 0.6, 0.2]} radius={0.05} position={[0, 0.5, -0.35]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Armlener */}
      <RoundedBox args={[0.2, 0.4, 0.9]} radius={0.05} position={[-1, 0.4, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.4, 0.9]} radius={0.05} position={[1, 0.4, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Puter */}
      <RoundedBox args={[0.6, 0.15, 0.4]} radius={0.08} position={[-0.5, 0.45, 0.1]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.2)} />
      </RoundedBox>
      <RoundedBox args={[0.6, 0.15, 0.4]} radius={0.08} position={[0.5, 0.45, 0.1]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.2)} />
      </RoundedBox>
      
      {/* Ben */}
      <Cylinder args={[0.04, 0.04, 0.15]} position={[-0.9, 0.075, -0.3]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.15]} position={[0.9, 0.075, -0.3]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.15]} position={[-0.9, 0.075, 0.3]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.15]} position={[0.9, 0.075, 0.3]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
    </group>
  )
}

/**
 * Bokhylle med hyller
 */
export const BookshelfAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#6b4423', selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'bookshelf' }}>
      {/* Siderammer */}
      <Box args={[0.05, 1.8, 0.35]} position={[-0.6, 0.9, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.05, 1.8, 0.35]} position={[0.6, 0.9, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Topp og bunn */}
      <Box args={[1.25, 0.05, 0.35]} position={[0, 0.025, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[1.25, 0.05, 0.35]} position={[0, 1.775, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Bakplate */}
      <Box args={[1.15, 1.7, 0.02]} position={[0, 0.9, -0.16]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.2)} />
      </Box>
      
      {/* Hyller */}
      {[0.4, 0.8, 1.2].map((height, i) => (
        <Box key={i} args={[1.15, 0.03, 0.33]} position={[0, height, 0]}>
          <meshStandardMaterial color={color} />
        </Box>
      ))}
      
      {/* Bøker som dekorasjon */}
      {[
        { pos: [-0.3, 1.3, 0], color: '#ff4444' },
        { pos: [-0.1, 1.3, 0], color: '#44ff44' },
        { pos: [0.1, 1.3, 0], color: '#4444ff' },
        { pos: [0.3, 1.3, 0], color: '#ffff44' },
      ].map((book, i) => (
        <Box key={i} args={[0.15, 0.25, 0.2]} position={book.pos}>
          <meshStandardMaterial color={book.color} />
        </Box>
      ))}
    </group>
  )
}

/**
 * Møtebord
 */
export const MeetingTableAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#654321', selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'meetingTable' }}>
      {/* Bordplate */}
      <RoundedBox args={[2.4, 0.08, 1.2]} radius={0.1} position={[0, 0.75, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Sentral støtte */}
      <Cylinder args={[0.4, 0.5, 0.05]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </Cylinder>
      
      {/* Vertikal søyle */}
      <Cylinder args={[0.08, 0.08, 0.65]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </Cylinder>
      
      {/* Glasstop (valgfritt) */}
      <Box args={[2.35, 0.005, 1.15]} position={[0, 0.795, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} metalness={1} roughness={0} />
      </Box>
    </group>
  )
}
