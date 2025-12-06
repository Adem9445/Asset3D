import { useRef } from 'react'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Oppvaskmaskin
 */
export const DishwasherAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.6
  const depth = dimensions?.depth || 0.6
  const height = dimensions?.height || 0.85
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'dishwasher' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#f3f4f6" metalness={0.3} />
      </RoundedBox>
      
      {/* Frontpanel */}
      <Box args={[width - 0.05, height - 0.05, 0.02]} position={[0, height/2, depth/2 + 0.001]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Håndtak */}
      <Box args={[width * 0.7, 0.03, 0.02]} position={[0, height - 0.05, depth/2 + 0.02]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[width * 0.5, 0.05, 0.001]} position={[0, height - 0.01, depth/2 + 0.001]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Status LEDs */}
      <Sphere args={[0.005]} position={[width * 0.15, height - 0.01, depth/2 + 0.002]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
      </Sphere>
      <Sphere args={[0.005]} position={[width * 0.1, height - 0.01, depth/2 + 0.002]}>
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  )
}

/**
 * Vaskemaskin
 */
export const WashingMachineAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.6
  const depth = dimensions?.depth || 0.6
  const height = dimensions?.height || 0.85
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'washingMachine' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth - 0.05]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.2} />
      </RoundedBox>
      
      {/* Dør/Luke */}
      <Cylinder args={[width * 0.35, width * 0.35, 0.02]} rotation={[0, 0, Math.PI/2]} position={[0, height * 0.55, depth/2 - 0.024]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[width * 0.3, width * 0.3, 0.02]} rotation={[0, 0, Math.PI/2]} position={[0, height * 0.55, depth/2 - 0.014]}>
        <meshStandardMaterial color="#222222" transparent opacity={0.8} />
      </Cylinder>
      
      {/* Kontrollpanel */}
      <Box args={[width - 0.1, 0.08, 0.02]} position={[0, height - 0.04, depth/2 - 0.024]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Display */}
      <Box args={[width * 0.25, 0.04, 0.001]} position={[-width * 0.15, height - 0.04, depth/2 - 0.013]}>
        <meshStandardMaterial color="#001122" emissive="#00ff00" emissiveIntensity={0.2} />
      </Box>
      
      {/* Knapper */}
      {[0.05, 0.1, 0.15].map((x, i) => (
        <Cylinder key={i} args={[0.015, 0.015, 0.01]} rotation={[Math.PI/2, 0, 0]} position={[width * (x + 0.1), height - 0.04, depth/2 - 0.013]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}
      
      {/* Skuff for vaskemiddel */}
      <Box args={[width * 0.2, 0.04, 0.05]} position={[-width * 0.35, height - 0.04, depth/2 - 0.05]}>
        <meshStandardMaterial color="#9ca3af" />
      </Box>
    </group>
  )
}

/**
 * Tørketrommel
 */
export const DryerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.6
  const depth = dimensions?.depth || 0.6
  const height = dimensions?.height || 0.85
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'dryer' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth - 0.05]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#f9fafb" metalness={0.2} />
      </RoundedBox>
      
      {/* Dør */}
      <Box args={[width * 0.75, height * 0.75, 0.02]} position={[0, height * 0.45, depth/2 - 0.024]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      <Box args={[width * 0.65, height * 0.7, 0.01]} position={[0, height * 0.45, depth/2 - 0.013]}>
        <meshStandardMaterial color="#333333" transparent opacity={0.9} />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.03, height * 0.2, 0.02]} position={[-width * 0.35, height * 0.45, depth/2 - 0.01]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[width - 0.1, 0.08, 0.02]} position={[0, height - 0.04, depth/2 - 0.024]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Filter-indikator */}
      <Box args={[0.08, 0.08, 0.01]} position={[0, height * 0.06, depth/2 - 0.024]}>
        <meshStandardMaterial color="#fbbf24" />
      </Box>
    </group>
  )
}

/**
 * Fryser (stor)
 */
export const FreezerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.7
  const depth = dimensions?.depth || 0.65
  const height = dimensions?.height || 1.8
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'freezer' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#e0f2fe" metalness={0.3} />
      </RoundedBox>
      
      {/* Dør */}
      <Box args={[width - 0.02, height - 0.05, 0.02]} position={[0, height/2, depth/2 + 0.011]}>
        <meshStandardMaterial color="#bae6fd" />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.03, height * 0.7, 0.02]} position={[-width * 0.4, height/2, depth/2 + 0.035]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </Box>
      
      {/* Display */}
      <Box args={[width * 0.3, height * 0.03, 0.001]} position={[0, height * 0.95, depth/2 + 0.012]}>
        <meshStandardMaterial color="#1a1a1a" emissive="#0ea5e9" emissiveIntensity={0.1} />
      </Box>
      
      {/* Temperatur-indikator */}
      <Box args={[width * 0.15, height * 0.015, 0.001]} position={[0, height * 0.92, depth/2 + 0.012]}>
        <meshStandardMaterial color="#001122" emissive="#00ffff" emissiveIntensity={0.3} />
      </Box>
    </group>
  )
}

/**
 * Komfyr med ovn
 */
export const StoveAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.6
  const depth = dimensions?.depth || 0.6
  const height = dimensions?.height || 0.85
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'stove' }}>
      {/* Hovedkropp/ovn */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, height/2, 0]}>
        <meshStandardMaterial color="#f3f4f6" metalness={0.3} />
      </RoundedBox>
      
      {/* Koketopp */}
      <Box args={[width - 0.02, 0.02, depth - 0.02]} position={[0, height + 0.01, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Kokeplater */}
      {[
        [-width * 0.25, height + 0.02, -depth * 0.25],
        [width * 0.25, height + 0.02, -depth * 0.25],
        [-width * 0.25, height + 0.02, depth * 0.25],
        [width * 0.25, height + 0.02, depth * 0.25]
      ].map((pos, i) => (
        <Cylinder key={i} args={[width * 0.15, width * 0.15, 0.01]} position={pos}>
          <meshStandardMaterial color="#333333" metalness={0.5} />
        </Cylinder>
      ))}
      
      {/* Ovnsdør */}
      <Box args={[width - 0.05, height * 0.45, 0.02]} position={[0, height * 0.35, depth/2 + 0.001]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[width * 0.8, height * 0.4, 0.01]} position={[0, height * 0.35, depth/2 + 0.012]}>
        <meshStandardMaterial color="#222222" transparent opacity={0.8} />
      </Box>
      
      {/* Håndtak */}
      <Box args={[width * 0.7, 0.03, 0.02]} position={[0, height * 0.6, depth/2 + 0.02]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[width - 0.1, height * 0.1, 0.02]} position={[0, height * 0.85, depth/2 + 0.001]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Knotter */}
      {[-0.2, -0.1, 0, 0.1, 0.2].map((xOffset, i) => (
        <Cylinder key={i} args={[0.02, 0.02, 0.02]} rotation={[Math.PI/2, 0, 0]} position={[xOffset * width, height * 0.85, depth/2 + 0.02]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}
    </group>
  )
}

/**
 * Ventilator/Kjøkkenvifte
 */
export const VentilatorAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.9
  const depth = dimensions?.depth || 0.5
  const height = dimensions?.height || 0.15 // Height of the main box
  // Pipe height usually extends up.
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'ventilator' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height, depth]} radius={0.02} position={[0, 0, 0]}>
        <meshStandardMaterial color="#d4d4d8" metalness={0.7} />
      </RoundedBox>
      
      {/* Filter/gitter */}
      <Box args={[width - 0.05, 0.02, depth - 0.05]} position={[0, -height/2 + 0.01, 0]}>
        <meshStandardMaterial color="#71717a" metalness={0.5} />
      </Box>
      
      {/* Lys */}
      {[-width * 0.25, width * 0.25].map((x, i) => (
        <Cylinder key={i} args={[0.05, 0.05, 0.01]} position={[x, -height/2, 0]}>
          <meshStandardMaterial color="#fffbeb" emissive="#fbbf24" emissiveIntensity={0.3} />
        </Cylinder>
      ))}
      
      {/* Kontrollknapper */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
        <Cylinder key={i} args={[0.015, 0.015, 0.01]} position={[x * width * 0.5, -height/2 + 0.02, depth/2 - 0.02]}>
          <meshStandardMaterial color="#404040" />
        </Cylinder>
      ))}
      
      {/* Avtrekksrør */}
      <Cylinder args={[width * 0.1, width * 0.1, 0.5]} position={[0, height/2 + 0.25, 0]}>
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} />
      </Cylinder>
    </group>
  )
}
