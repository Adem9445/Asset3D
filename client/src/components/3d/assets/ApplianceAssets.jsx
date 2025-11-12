import { useRef } from 'react'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Oppvaskmaskin
 */
export const DishwasherAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'dishwasher' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.6, 0.85, 0.6]} radius={0.02} position={[0, 0.425, 0]}>
        <meshStandardMaterial color="#f3f4f6" metalness={0.3} />
      </RoundedBox>
      
      {/* Frontpanel */}
      <Box args={[0.55, 0.8, 0.02]} position={[0, 0.425, 0.301]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.4, 0.03, 0.02]} position={[0, 0.8, 0.32]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[0.3, 0.05, 0.001]} position={[0, 0.85, 0.301]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Status LEDs */}
      <Sphere args={[0.005]} position={[0.1, 0.85, 0.302]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
      </Sphere>
      <Sphere args={[0.005]} position={[0.05, 0.85, 0.302]}>
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  )
}

/**
 * Vaskemaskin
 */
export const WashingMachineAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'washingMachine' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.6, 0.85, 0.55]} radius={0.02} position={[0, 0.425, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.2} />
      </RoundedBox>
      
      {/* Dør/Luke */}
      <Cylinder args={[0.22, 0.22, 0.02]} rotation={[0, 0, Math.PI/2]} position={[0, 0.45, 0.276]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
      <Cylinder args={[0.2, 0.2, 0.02]} rotation={[0, 0, Math.PI/2]} position={[0, 0.45, 0.286]}>
        <meshStandardMaterial color="#222222" transparent opacity={0.8} />
      </Cylinder>
      
      {/* Kontrollpanel */}
      <Box args={[0.5, 0.08, 0.02]} position={[0, 0.81, 0.276]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Display */}
      <Box args={[0.15, 0.04, 0.001]} position={[-0.1, 0.81, 0.287]}>
        <meshStandardMaterial color="#001122" emissive="#00ff00" emissiveIntensity={0.2} />
      </Box>
      
      {/* Knapper */}
      {[0.05, 0.1, 0.15].map((x, i) => (
        <Cylinder key={i} args={[0.015, 0.015, 0.01]} rotation={[Math.PI/2, 0, 0]} position={[x, 0.81, 0.287]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}
      
      {/* Skuff for vaskemiddel */}
      <Box args={[0.12, 0.04, 0.05]} position={[-0.22, 0.81, 0.25]}>
        <meshStandardMaterial color="#9ca3af" />
      </Box>
    </group>
  )
}

/**
 * Tørketrommel
 */
export const DryerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'dryer' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.6, 0.85, 0.55]} radius={0.02} position={[0, 0.425, 0]}>
        <meshStandardMaterial color="#f9fafb" metalness={0.2} />
      </RoundedBox>
      
      {/* Dør */}
      <Box args={[0.45, 0.65, 0.02]} position={[0, 0.375, 0.276]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      <Box args={[0.4, 0.6, 0.01]} position={[0, 0.375, 0.287]}>
        <meshStandardMaterial color="#333333" transparent opacity={0.9} />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.03, 0.2, 0.02]} position={[-0.23, 0.4, 0.29]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[0.5, 0.08, 0.02]} position={[0, 0.81, 0.276]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Filter-indikator */}
      <Box args={[0.08, 0.08, 0.01]} position={[0, 0.05, 0.276]}>
        <meshStandardMaterial color="#fbbf24" />
      </Box>
    </group>
  )
}

/**
 * Fryser (stor)
 */
export const FreezerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'freezer' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.7, 1.8, 0.65]} radius={0.02} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#e0f2fe" metalness={0.3} />
      </RoundedBox>
      
      {/* Dør */}
      <Box args={[0.68, 1.75, 0.02]} position={[0, 0.9, 0.336]}>
        <meshStandardMaterial color="#bae6fd" />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.03, 1.2, 0.02]} position={[-0.3, 0.9, 0.36]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </Box>
      
      {/* Display */}
      <Box args={[0.2, 0.06, 0.001]} position={[0, 1.7, 0.337]}>
        <meshStandardMaterial color="#1a1a1a" emissive="#0ea5e9" emissiveIntensity={0.1} />
      </Box>
      
      {/* Temperatur-indikator */}
      <Box args={[0.1, 0.03, 0.001]} position={[0, 1.65, 0.337]}>
        <meshStandardMaterial color="#001122" emissive="#00ffff" emissiveIntensity={0.3} />
      </Box>
    </group>
  )
}

/**
 * Komfyr med ovn
 */
export const StoveAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'stove' }}>
      {/* Hovedkropp/ovn */}
      <RoundedBox args={[0.6, 0.85, 0.6]} radius={0.02} position={[0, 0.425, 0]}>
        <meshStandardMaterial color="#f3f4f6" metalness={0.3} />
      </RoundedBox>
      
      {/* Koketopp */}
      <Box args={[0.58, 0.02, 0.58]} position={[0, 0.86, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Kokeplater */}
      {[
        [-0.15, 0.87, -0.15],
        [0.15, 0.87, -0.15],
        [-0.15, 0.87, 0.15],
        [0.15, 0.87, 0.15]
      ].map((pos, i) => (
        <Cylinder key={i} args={[0.1, 0.1, 0.01]} position={pos}>
          <meshStandardMaterial color="#333333" metalness={0.5} />
        </Cylinder>
      ))}
      
      {/* Ovnsdør */}
      <Box args={[0.55, 0.4, 0.02]} position={[0, 0.3, 0.301]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.5, 0.35, 0.01]} position={[0, 0.3, 0.312]}>
        <meshStandardMaterial color="#222222" transparent opacity={0.8} />
      </Box>
      
      {/* Håndtak */}
      <Box args={[0.4, 0.03, 0.02]} position={[0, 0.52, 0.32]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </Box>
      
      {/* Kontrollpanel */}
      <Box args={[0.5, 0.08, 0.02]} position={[0, 0.75, 0.301]}>
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Knotter */}
      {[-0.2, -0.1, 0, 0.1, 0.2].map((x, i) => (
        <Cylinder key={i} args={[0.02, 0.02, 0.02]} rotation={[Math.PI/2, 0, 0]} position={[x, 0.75, 0.32]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}
    </group>
  )
}

/**
 * Ventilator/Kjøkkenvifte
 */
export const VentilatorAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'ventilator' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.9, 0.15, 0.5]} radius={0.02} position={[0, 2, 0]}>
        <meshStandardMaterial color="#d4d4d8" metalness={0.7} />
      </RoundedBox>
      
      {/* Filter/gitter */}
      <Box args={[0.85, 0.02, 0.45]} position={[0, 1.91, 0]}>
        <meshStandardMaterial color="#71717a" metalness={0.5} />
      </Box>
      
      {/* Lys */}
      {[-0.25, 0.25].map((x, i) => (
        <Cylinder key={i} args={[0.05, 0.05, 0.01]} position={[x, 1.9, 0]}>
          <meshStandardMaterial color="#fffbeb" emissive="#fbbf24" emissiveIntensity={0.3} />
        </Cylinder>
      ))}
      
      {/* Kontrollknapper */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
        <Cylinder key={i} args={[0.015, 0.015, 0.01]} position={[x, 1.92, 0.23]}>
          <meshStandardMaterial color="#404040" />
        </Cylinder>
      ))}
      
      {/* Avtrekksrør */}
      <Cylinder args={[0.08, 0.08, 0.5]} position={[0, 2.25, 0]}>
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} />
      </Cylinder>
    </group>
  )
}
