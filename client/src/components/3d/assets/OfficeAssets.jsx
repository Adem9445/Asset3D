import { useRef } from 'react'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Datamaskin med skjerm og tastatur
 */
export const ComputerAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  // Default dims for "computer" in catalog: 0.4, 0.3, 0.3.
  // The current code is a bit complex: Screen, Keyboard, Mouse, Tower.
  // We'll treat width/depth/height as bounding box roughly.
  // But wait, "Computer" usually implies the monitor + accessories on desk.
  // Existing code: Screen args [0.6, 0.4, 0.02].
  const width = dimensions?.width || 0.6
  const height = dimensions?.height || 0.4 // Screen height
  // depth is mostly ignored for flat screen, but used for stand
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'computer' }}>
      {/* Skjerm */}
      <RoundedBox args={[width, height, 0.02]} radius={0.01} position={[0, height/2 + 0.1, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Skjerm display */}
      <Box args={[width - 0.05, height - 0.05, 0.001]} position={[0, height/2 + 0.1, 0.011]}>
        <meshStandardMaterial color="#222222" emissive="#0066ff" emissiveIntensity={0.2} />
      </Box>
      
      {/* Skjermfot */}
      <Box args={[width * 0.25, 0.15, 0.02]} position={[0, 0.075, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Box>
      
      {/* Skjermbase */}
      <Cylinder args={[width * 0.2, width * 0.25, 0.02]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Tastatur */}
      <RoundedBox args={[width * 0.75, 0.02, 0.15]} radius={0.005} position={[0, 0, 0.25]}>
        <meshStandardMaterial color="#333333" />
      </RoundedBox>
      
      {/* Mus */}
      <RoundedBox args={[0.06, 0.02, 0.1]} radius={0.01} position={[width * 0.5, 0, 0.25]}>
        <meshStandardMaterial color="#333333" />
      </RoundedBox>
      
      {/* PC Tower - if dimensions are large enough, maybe it includes tower? */}
      {/* Keeping tower offset */}
      <RoundedBox args={[0.15, 0.4, 0.35]} radius={0.01} position={[width * 0.8, 0.2, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Power LED */}
      <Sphere args={[0.01]} position={[width * 0.8 - 0.075, 0.35, 0.176]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} />
      </Sphere>
    </group>
  )
}

/**
 * Skriver/printer
 */
export const PrinterAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.5
  const depth = dimensions?.depth || 0.4
  const height = dimensions?.height || 0.3
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'printer' }}>
      {/* Hovedkropp */}
      <RoundedBox args={[width, height * 0.8, depth]} radius={0.02} position={[0, height * 0.4, 0]}>
        <meshStandardMaterial color="#e5e7eb" />
      </RoundedBox>
      
      {/* Papirskuff */}
      <Box args={[width * 0.7, 0.03, depth * 0.6]} position={[0, 0.015, depth * 0.125]}>
        <meshStandardMaterial color="#d1d5db" />
      </Box>
      
      {/* Topplock */}
      <RoundedBox args={[width * 0.96, 0.03, depth * 0.95]} radius={0.02} position={[0, height * 0.8 + 0.015, 0]}>
        <meshStandardMaterial color="#9ca3af" />
      </RoundedBox>
      
      {/* Kontrollpanel */}
      <Box args={[width * 0.3, 0.001, depth * 0.2]} position={[width * 0.2, height * 0.83, -depth * 0.25]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Box>
      
      {/* Utskuff */}
      <Box args={[width * 0.8, 0.02, depth * 0.4]} position={[0, height * 0.5, depth * 0.5]}>
        <meshStandardMaterial color="#f3f4f6" />
      </Box>
      
      {/* Status LEDs */}
      <Sphere args={[0.005]} position={[width * 0.35, height * 0.83, -depth * 0.25]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.8} />
      </Sphere>
      <Sphere args={[0.005]} position={[width * 0.35, height * 0.83, -depth * 0.2]}>
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  )
}

/**
 * Telefon
 */
export const PhoneAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.2
  const depth = dimensions?.depth || 0.15
  const height = dimensions?.height || 0.1
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'phone' }}>
      {/* Base */}
      <RoundedBox args={[width, height * 0.5, depth]} radius={0.01} position={[0, height * 0.25, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>
      
      {/* Håndtak */}
      <RoundedBox args={[width * 0.9, height * 0.4, depth * 0.4]} radius={0.02} position={[0, height * 0.7, 0]}>
        <meshStandardMaterial color="#333333" />
      </RoundedBox>
      
      {/* Display */}
      <Box args={[width * 0.6, 0.001, depth * 0.5]} position={[0, height * 0.5 + 0.001, 0]}>
        <meshStandardMaterial color="#001122" emissive="#00ff00" emissiveIntensity={0.1} />
      </Box>
      
      {/* Knapper */}
      {/* Simplification: Just texture or small boxes based on size */}
      <Cylinder args={[0.01, 0.01, 0.002]} rotation={[Math.PI/2, 0, 0]} position={[-width*0.25, height*0.5+0.001, -depth*0.1]}>
        <meshStandardMaterial color="#666666" />
      </Cylinder>
    </group>
  )
}

/**
 * Whiteboard
 */
export const WhiteboardAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 1.5
  const height = dimensions?.height || 1.0 // Board height
  // Total height on stand is usually taller.
  // Catalog says H=1.0. Let's assume that's the board size, or total height?
  // Usually whiteboard 1.5x1.0 implies the board dimensions. Stand makes it taller.
  // Let's assume height is the board height, and we place it on a stand.
  // Or if height=1.8 (typical), then it's total height.
  // Catalog says H=1.0. If that's total height, it's a small board.
  // Let's assume dimensions are the board dimensions.
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'whiteboard' }}>
      {/* Ramme */}
      <RoundedBox args={[width, height, 0.05]} radius={0.02} position={[0, height/2 + 0.5, 0]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </RoundedBox>
      
      {/* Tavle */}
      <Box args={[width - 0.1, height - 0.1, 0.01]} position={[0, height/2 + 0.5, 0.021]}>
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </Box>
      
      {/* Stativ ben */}
      <Cylinder args={[0.02, 0.02, height + 0.8]} rotation={[0, 0, Math.PI/12]} position={[-width * 0.2, (height + 0.8)/2, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, height + 0.8]} rotation={[0, 0, -Math.PI/12]} position={[width * 0.2, (height + 0.8)/2, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Støtteben */}
      <Cylinder args={[0.015, 0.015, 0.6]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Pennhylle */}
      <Box args={[width - 0.1, 0.03, 0.05]} position={[0, 0.5 + 0.05, 0.025]}>
        <meshStandardMaterial color="#9ca3af" />
      </Box>
    </group>
  )
}

/**
 * Arkivskap
 */
export const FilingCabinetAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, color = '#6b7280', selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.5
  const depth = dimensions?.depth || 0.6
  const height = dimensions?.height || 1.2
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'filingCabinet' }}>
      {/* Hovedkabinett */}
      <RoundedBox args={[width, height, depth]} radius={0.01} position={[0, height/2, 0]}>
        <meshStandardMaterial color={color} metalness={0.3} />
      </RoundedBox>
      
      {/* Skuffer */}
      {[0.75, 0.5, 0.25].map((ratio, i) => (
        <group key={i}>
          <Box args={[width - 0.02, height * 0.23, 0.02]} position={[0, height * ratio, depth/2 + 0.001]}>
            <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.1)} />
          </Box>
          {/* Håndtak */}
          <Box args={[width * 0.3, 0.02, 0.01]} position={[0, height * ratio, depth/2 + 0.015]}>
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
export const TrashBinAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, color = '#4b5563', selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.3
  const height = dimensions?.height || 0.4
  // For cylinder, width is diameter. radius = width / 2
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'trashBin' }}>
      {/* Bøtte */}
      <Cylinder args={[width/2, width/2 * 0.8, height]} position={[0, height/2, 0]}>
        <meshStandardMaterial color={color} />
      </Cylinder>
      
      {/* Lokk */}
      <Cylinder args={[width/2 + 0.01, width/2 + 0.01, 0.02]} position={[0, height + 0.01, 0]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.2)} />
      </Cylinder>
      
      {/* Håndtak */}
      <Cylinder args={[0.01, 0.01, width * 0.4]} rotation={[Math.PI/2, 0, 0]} position={[0, height + 0.02, 0]}>
        <meshStandardMaterial color="#333333" />
      </Cylinder>
    </group>
  )
}
