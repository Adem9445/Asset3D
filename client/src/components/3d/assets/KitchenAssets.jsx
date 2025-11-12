import { useRef } from 'react'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Kaffemaskin
 */
export const CoffeeMachineAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'coffeeMachine' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.25, 0.35, 0.2]} radius={0.02} position={[0, 0.175, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Vannbeholder */}
      <Box args={[0.08, 0.25, 0.15]} position={[-0.085, 0.175, 0]}>
        <meshStandardMaterial color="#333333" transparent opacity={0.8} />
      </Box>
      
      {/* Kaffeutløp */}
      <Cylinder args={[0.015, 0.01, 0.08]} position={[0.08, 0.25, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Dryppbrett */}
      <Box args={[0.2, 0.02, 0.15]} position={[0, 0.01, 0.025]}>
        <meshStandardMaterial color="#444444" metalness={0.5} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[0.06, 0.08, 0.001]} position={[0, 0.25, 0.101]}>
        <meshStandardMaterial color="#222222" />
      </Box>
      
      {/* Power LED */}
      <Sphere args={[0.005]} position={[0.02, 0.27, 0.102]}>
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </Sphere>
      
      {/* Knapper */}
      {[-0.015, 0, 0.015].map((x, i) => (
        <Cylinder key={i} args={[0.008, 0.008, 0.002]} rotation={[Math.PI/2, 0, 0]} position={[x, 0.23, 0.102]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}
    </group>
  )
}

/**
 * Mikrobølgeovn
 */
export const MicrowaveAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'microwave' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.5, 0.3, 0.35]} radius={0.02} position={[0, 0.15, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </RoundedBox>
      
      {/* Dør */}
      <Box args={[0.35, 0.25, 0.01]} position={[0.05, 0.15, 0.176]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Vindusrute */}
      <Box args={[0.3, 0.2, 0.001]} position={[0.05, 0.15, 0.182]}>
        <meshStandardMaterial color="#222222" transparent opacity={0.8} />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.02, 0.15, 0.02]} position={[-0.115, 0.15, 0.19]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[0.1, 0.25, 0.001]} position={[-0.175, 0.15, 0.176]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* Display */}
      <Box args={[0.08, 0.03, 0.001]} position={[-0.175, 0.22, 0.177]}>
        <meshStandardMaterial color="#001100" emissive="#00ff00" emissiveIntensity={0.2} />
      </Box>
      
      {/* Knapper */}
      {[
        [-0.2, 0.15], [-0.17, 0.15], [-0.14, 0.15],
        [-0.2, 0.12], [-0.17, 0.12], [-0.14, 0.12],
      ].map((pos, i) => (
        <Box key={i} args={[0.02, 0.02, 0.002]} position={[pos[0], pos[1], 0.177]}>
          <meshStandardMaterial color="#555555" />
        </Box>
      ))}
    </group>
  )
}

/**
 * Kjøleskap
 */
export const RefrigeratorAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'refrigerator' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.7, 1.8, 0.65]} radius={0.02} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#f3f4f6" metalness={0.3} />
      </RoundedBox>
      
      {/* Fryserdør (topp) */}
      <Box args={[0.68, 0.5, 0.02]} position={[0, 1.4, 0.336]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Kjøleskapsdør (bunn) */}
      <Box args={[0.68, 1.25, 0.02]} position={[0, 0.625, 0.336]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Håndtak fryser */}
      <Box args={[0.03, 0.35, 0.02]} position={[-0.3, 1.4, 0.36]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Håndtak kjøleskap */}
      <Box args={[0.03, 0.8, 0.02]} position={[-0.3, 0.625, 0.36]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Display/kontroller */}
      <Box args={[0.15, 0.05, 0.001]} position={[0, 1.66, 0.326]}>
        <meshStandardMaterial color="#1a1a1a" emissive="#0066ff" emissiveIntensity={0.1} />
      </Box>
    </group>
  )
}

/**
 * Vannkjøler
 */
export const WaterCoolerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'waterCooler' }}>
      {/* Base */}
      <RoundedBox args={[0.35, 0.8, 0.35]} radius={0.02} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </RoundedBox>
      
      {/* Vanntank holder */}
      <Cylinder args={[0.08, 0.08, 0.3]} position={[0, 0.95, 0]}>
        <meshStandardMaterial color="#9ca3af" />
      </Cylinder>
      
      {/* Vanntank */}
      <Cylinder args={[0.12, 0.1, 0.35]} position={[0, 1.175, 0]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
      </Cylinder>
      
      {/* Tappekraner */}
      <Cylinder args={[0.015, 0.015, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[-0.05, 0.6, 0.18]}>
        <meshStandardMaterial color="#ef4444" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.015, 0.015, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[0.05, 0.6, 0.18]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.8} />
      </Cylinder>
      
      {/* Dryppbrett */}
      <Box args={[0.2, 0.02, 0.15]} position={[0, 0.3, 0.1]}>
        <meshStandardMaterial color="#6b7280" />
      </Box>
      
      {/* Kopp-holder fordypning */}
      <Box args={[0.18, 0.15, 0.05]} position={[0, 0.45, 0.15]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>
    </group>
  )
}

/**
 * Plante
 */
export const PlantAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'plant' }}>
      {/* Potte */}
      <Cylinder args={[0.12, 0.15, 0.2]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Cylinder>
      
      {/* Jord */}
      <Cylinder args={[0.11, 0.11, 0.02]} position={[0, 0.19, 0]}>
        <meshStandardMaterial color="#3e2723" />
      </Cylinder>
      
      {/* Stamme */}
      <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.35, 0]}>
        <meshStandardMaterial color="#5d4037" />
      </Cylinder>
      
      {/* Blader */}
      {[
        { pos: [0, 0.5, 0], scale: [0.15, 0.08, 0.15] },
        { pos: [0.08, 0.45, 0], scale: [0.12, 0.06, 0.12] },
        { pos: [-0.08, 0.48, 0.05], scale: [0.12, 0.06, 0.12] },
        { pos: [0, 0.42, -0.08], scale: [0.1, 0.05, 0.1] },
      ].map((leaf, i) => (
        <Sphere key={i} args={leaf.scale} position={leaf.pos}>
          <meshStandardMaterial color="#4caf50" />
        </Sphere>
      ))}
    </group>
  )
}
