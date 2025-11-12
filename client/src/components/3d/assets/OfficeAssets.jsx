import { useRef } from 'react'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Datamaskin med skjerm og tastatur
 */
export const ComputerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'computer' }}>
      {/* Skjerm */}
      <RoundedBox args={[0.6, 0.4, 0.02]} radius={0.01} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Skjerm display */}
      <Box args={[0.55, 0.35, 0.001]} position={[0, 0.2, 0.011]}>
        <meshStandardMaterial color="#222222" emissive="#0066ff" emissiveIntensity={0.2} />
      </Box>
      
      {/* Skjermfot */}
      <Box args={[0.15, 0.15, 0.02]} position={[0, -0.075, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Box>
      
      {/* Skjermbase */}
      <Cylinder args={[0.12, 0.15, 0.02]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Tastatur */}
      <RoundedBox args={[0.45, 0.02, 0.15]} radius={0.005} position={[0, -0.15, 0.2]}>
        <meshStandardMaterial color="#333333" />
      </RoundedBox>
      
      {/* Mus */}
      <RoundedBox args={[0.06, 0.02, 0.1]} radius={0.01} position={[0.3, -0.15, 0.2]}>
        <meshStandardMaterial color="#333333" />
      </RoundedBox>
      
      {/* PC Tower */}
      <RoundedBox args={[0.15, 0.4, 0.35]} radius={0.01} position={[0.5, -0.05, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Power LED */}
      <Sphere args={[0.01]} position={[0.425, 0.1, 0.176]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
      </Sphere>
    </group>
  )
}

/**
 * Skriver/printer
 */
export const PrinterAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'printer' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[0.5, 0.25, 0.4]} radius={0.02} position={[0, 0.125, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </RoundedBox>
      
      {/* Papirskuff */}
      <Box args={[0.35, 0.03, 0.25]} position={[0, 0.015, 0.05]}>
        <meshStandardMaterial color="#d1d5db" />
      </Box>
      
      {/* Topplock */}
      <RoundedBox args={[0.48, 0.03, 0.38]} radius={0.02} position={[0, 0.265, 0]}>
        <meshStandardMaterial color="#9ca3af" />
      </RoundedBox>
      
      {/* Kontrollpanel */}
      <Box args={[0.15, 0.001, 0.08]} position={[0.1, 0.281, -0.1]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Utskuff */}
      <Box args={[0.4, 0.02, 0.15]} position={[0, 0.15, 0.225]}>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      
      {/* Status LEDs */}
      <Sphere args={[0.005]} position={[0.18, 0.27, -0.1]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
      </Sphere>
      <Sphere args={[0.005]} position={[0.18, 0.27, -0.08]}>
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  )
}

/**
 * Telefon
 */
export const PhoneAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'phone' }}>
      {/* Base */}
      <RoundedBox args={[0.2, 0.05, 0.15]} radius={0.01} position={[0, 0.025, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Håndtak */}
      <RoundedBox args={[0.18, 0.04, 0.06]} radius={0.02} position={[0, 0.07, 0]}>
        <meshStandardMaterial color="#333333" />
      </RoundedBox>
      
      {/* Display */}
      <Box args={[0.12, 0.001, 0.08]} position={[0, 0.051, 0]}>
        <meshStandardMaterial color="#001122" emissive="#00ff00" emissiveIntensity={0.1} />
      </Box>
      
      {/* Knapper */}
      {[
        [-0.05, 0, -0.02], [0, 0, -0.02], [0.05, 0, -0.02],
        [-0.05, 0, 0.02], [0, 0, 0.02], [0.05, 0, 0.02],
      ].map((pos, i) => (
        <Cylinder key={i} args={[0.01, 0.01, 0.002]} rotation={[Math.PI/2, 0, 0]} position={[pos[0], 0.051, pos[2]]}>
          <meshStandardMaterial color="#666666" />
        </Cylinder>
      ))}
    </group>
  )
}

/**
 * Whiteboard
 */
export const WhiteboardAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'whiteboard' }}>
      {/* Ramme */}
      <RoundedBox args={[1.5, 1, 0.05]} radius={0.02} position={[0, 1, 0]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </RoundedBox>
      
      {/* Tavle */}
      <Box args={[1.4, 0.9, 0.01]} position={[0, 1, 0.021]}>
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </Box>
      
      {/* Stativ ben */}
      <Cylinder args={[0.02, 0.02, 1.8]} rotation={[0, 0, Math.PI/12]} position={[-0.3, 0.9, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 1.8]} rotation={[0, 0, -Math.PI/12]} position={[0.3, 0.9, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Støtteben */}
      <Cylinder args={[0.015, 0.015, 0.6]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Pennhylle */}
      <Box args={[1.4, 0.03, 0.05]} position={[0, 0.48, 0.025]}>
        <meshStandardMaterial color="#9ca3af" />
      </Box>
    </group>
  )
}

/**
 * Arkivskap
 */
export const FilingCabinetAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#6b7280', selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'filingCabinet' }}>
      {/* Hovedkabinett */}
      <RoundedBox args={[0.5, 1.2, 0.6]} radius={0.01} position={[0, 0.6, 0]}>
        <meshStandardMaterial color={color} metalness={0.3} />
      </RoundedBox>
      
      {/* Skuffer */}
      {[0.9, 0.6, 0.3].map((height, i) => (
        <group key={i}>
          <Box args={[0.48, 0.28, 0.02]} position={[0, height, 0.301]}>
            <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.1)} />
          </Box>
          {/* Håndtak */}
          <Box args={[0.15, 0.02, 0.01]} position={[0, height, 0.315]}>
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </Box>
        </group>
      ))}
    </group>
  )
}

/**
 * Søppelbøtte
 */
export const TrashBinAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], color = '#4b5563', selected = false }) => {
  const groupRef = useRef()
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'trashBin' }}>
      {/* Bøtte */}
      <Cylinder args={[0.15, 0.18, 0.4]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color={color} />
      </Cylinder>
      
      {/* Lokk */}
      <Cylinder args={[0.16, 0.16, 0.02]} position={[0, 0.41, 0]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.2)} />
      </Cylinder>
      
      {/* Håndtak */}
      <Cylinder args={[0.01, 0.01, 0.08]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.42, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
    </group>
  )
}
