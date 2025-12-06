import { useRef } from 'react'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Kaffemaskin
 */
export const CoffeeMachineAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.25
  const depth = dimensions?.depth || 0.2
  const height = dimensions?.height || 0.35
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'coffeeMachine' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Vannbeholder */}
      <Box args={[width * 0.3, height * 0.7, depth * 0.7]} position={[-width * 0.35, height/2, 0]}>
        <meshStandardMaterial color="#333333" transparent opacity={0.8} />
      </Box>
      
      {/* Kaffeutløp */}
      <Cylinder args={[width * 0.06, width * 0.04, height * 0.2]} position={[width * 0.3, height * 0.7, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Dryppbrett */}
      <Box args={[width * 0.8, 0.02, depth * 0.7]} position={[0, 0.01, depth * 0.15]}>
        <meshStandardMaterial color="#444444" metalness={0.5} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[width * 0.25, height * 0.2, 0.001]} position={[0, height * 0.7, depth/2 + 0.001]}>
        <meshStandardMaterial color="#222222" />
      </Box>
      
      {/* Power LED */}
      <Sphere args={[0.005]} position={[width * 0.08, height * 0.75, depth/2 + 0.002]}>
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} />
      </Sphere>
      
      {/* Knapper */}
      {[-1, 0, 1].map((offset, i) => (
        <Cylinder key={i} args={[0.008, 0.008, 0.002]} rotation={[Math.PI/2, 0, 0]} position={[offset * 0.03, height * 0.65, depth/2 + 0.002]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}
    </group>
  )
}

/**
 * Mikrobølgeovn
 */
export const MicrowaveAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.5
  const depth = dimensions?.depth || 0.35
  const height = dimensions?.height || 0.3
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'microwave' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </RoundedBox>
      
      {/* Dør */}
      <Box args={[width * 0.7, height * 0.8, 0.01]} position={[width * 0.1, height/2, depth/2 + 0.001]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Vindusrute */}
      <Box args={[width * 0.6, height * 0.6, 0.001]} position={[width * 0.1, height/2, depth/2 + 0.007]}>
        <meshStandardMaterial color="#222222" transparent opacity={0.8} />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.02, height * 0.5, 0.02]} position={[-width * 0.23, height/2, depth/2 + 0.015]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[width * 0.2, height * 0.8, 0.001]} position={[-width * 0.35, height/2, depth/2 + 0.001]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* Display */}
      <Box args={[width * 0.16, height * 0.1, 0.001]} position={[-width * 0.35, height * 0.7, depth/2 + 0.002]}>
        <meshStandardMaterial color="#001100" emissive="#00ff00" emissiveIntensity={0.2} />
      </Box>
      
      {/* Knapper - simplified */}
      <Box args={[0.02, 0.02, 0.002]} position={[-width * 0.35, height * 0.4, depth/2 + 0.002]}>
          <meshStandardMaterial color="#555555" />
      </Box>
    </group>
  )
}

/**
 * Kjøleskap
 */
export const RefrigeratorAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.7
  const depth = dimensions?.depth || 0.65
  const height = dimensions?.height || 1.8
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'refrigerator' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#f3f4f6" metalness={0.3} />
      </RoundedBox>
      
      {/* Fryserdør (topp) - assuming approx 30% */}
      <Box args={[width - 0.02, height * 0.28, 0.02]} position={[0, height * 0.78, depth/2 + 0.011]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Kjøleskapsdør (bunn) */}
      <Box args={[width - 0.02, height * 0.69, 0.02]} position={[0, height * 0.35, depth/2 + 0.011]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Håndtak fryser */}
      <Box args={[0.03, height * 0.2, 0.02]} position={[-width * 0.4, height * 0.78, depth/2 + 0.035]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Håndtak kjøleskap */}
      <Box args={[0.03, height * 0.45, 0.02]} position={[-width * 0.4, height * 0.35, depth/2 + 0.035]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Display/kontroller */}
      <Box args={[width * 0.2, height * 0.03, 0.001]} position={[0, height * 0.92, depth/2 + 0.001]}>
        <meshStandardMaterial color="#1a1a1a" emissive="#0066ff" emissiveIntensity={0.1} />
      </Box>
    </group>
  )
}

/**
 * Vannkjøler
 */
export const WaterCoolerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.35
  const depth = dimensions?.depth || 0.35
  const height = dimensions?.height || 1.2 // excluding bottle

  // Base unit usually has height, and bottle adds to it.
  // Dimensions likely refer to the base unit + bottle total?
  // Let's assume height is total.
  // Base ~2/3, bottle ~1/3.
  const baseHeight = height * 0.66
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'waterCooler' }}>
      {/* Base */}
      <RoundedBox args={[width, baseHeight, depth]} radius={0.02} position={[0, baseHeight/2, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </RoundedBox>
      
      {/* Vanntank holder */}
      <Cylinder args={[width * 0.25, width * 0.25, height * 0.1]} position={[0, baseHeight + height * 0.05, 0]}>
        <meshStandardMaterial color="#9ca3af" />
      </Cylinder>
      
      {/* Vanntank */}
      <Cylinder args={[width * 0.35, width * 0.3, height * 0.3]} position={[0, height - height * 0.15, 0]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
      </Cylinder>
      
      {/* Tappekraner */}
      <Cylinder args={[0.015, 0.015, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[-width * 0.15, baseHeight * 0.75, depth/2 + 0.005]}>
        <meshStandardMaterial color="#ef4444" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.015, 0.015, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[width * 0.15, baseHeight * 0.75, depth/2 + 0.005]}>
        <meshStandardMaterial color="#3b82f6" metalness={0.8} />
      </Cylinder>
      
      {/* Dryppbrett */}
      <Box args={[width * 0.6, 0.02, depth * 0.4]} position={[0, baseHeight * 0.4, depth/2 - depth * 0.2]}>
        <meshStandardMaterial color="#6b7280" />
      </Box>
      
      {/* Kopp-holder fordypning */}
      <Box args={[width * 0.5, baseHeight * 0.2, depth * 0.15]} position={[0, baseHeight * 0.55, depth/2 - depth * 0.1]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>
    </group>
  )
}

/**
 * Plante
 */
export const PlantAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.3
  const height = dimensions?.height || 0.6
  // Pot usually takes up lower 1/3
  const potHeight = height * 0.3
  const potRadius = width / 2
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'plant' }}>
      {/* Potte */}
      <Cylinder args={[potRadius, potRadius * 0.8, potHeight]} position={[0, potHeight/2, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Cylinder>
      
      {/* Jord */}
      <Cylinder args={[potRadius * 0.9, potRadius * 0.75, 0.02]} position={[0, potHeight - 0.01, 0]}>
        <meshStandardMaterial color="#3e2723" />
      </Cylinder>
      
      {/* Stamme */}
      <Cylinder args={[0.02, 0.02, height * 0.5]} position={[0, potHeight + height * 0.25, 0]}>
        <meshStandardMaterial color="#5d4037" />
      </Cylinder>
      
      {/* Blader */}
      {[
        { pos: [0, height * 0.8, 0], scale: [width * 0.5, 0.08, width * 0.5] },
        { pos: [width * 0.2, height * 0.75, 0], scale: [width * 0.4, 0.06, width * 0.4] },
        { pos: [-width * 0.2, height * 0.78, 0.05], scale: [width * 0.4, 0.06, width * 0.4] },
        { pos: [0, height * 0.7, -width * 0.2], scale: [width * 0.35, 0.05, width * 0.35] },
      ].map((leaf, i) => (
        <Sphere key={i} args={leaf.scale} position={leaf.pos}>
          <meshStandardMaterial color="#4caf50" />
        </Sphere>
      ))}
    </group>
  )
}
