import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder, Sphere, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Moderne kontorpult med detaljer
 */
export const DeskAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, color = '#8B4513', selected = false }) => {
  const groupRef = useRef()
  
  // Use dimensions if provided, otherwise default to current hardcoded values
  const width = dimensions?.width || 1.8
  const depth = dimensions?.depth || 0.9
  const height = dimensions?.height || 0.75
  const thickness = 0.05

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

  const legHeight = height - thickness
  const legThickness = 0.05
  // Position legs relative to corners with some offset
  const legOffsetX = width / 2 - legThickness / 2 - 0.05
  const legOffsetZ = depth / 2 - legThickness / 2 - 0.15 // Slightly indented

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'desk' }}>
      {/* Bordplate */}
      <RoundedBox args={[width, thickness, depth]} radius={0.02} position={[0, height - thickness/2, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Bein */}
      <Box args={[legThickness, legHeight, legThickness]} position={[-legOffsetX, legHeight/2, -legOffsetZ]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[legThickness, legHeight, legThickness]} position={[legOffsetX, legHeight/2, -legOffsetZ]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[legThickness, legHeight, legThickness]} position={[-legOffsetX, legHeight/2, legOffsetZ]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[legThickness, legHeight, legThickness]} position={[legOffsetX, legHeight/2, legOffsetZ]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* Skuffeseksjon - scale and position relative to desk size */}
      <group position={[width/2 - 0.3, legHeight/2, 0]}>
        <RoundedBox args={[0.4, 0.5, 0.45]} radius={0.01} position={[0, (0.5 - legHeight)/2 + 0.1, 0]}>
          <meshStandardMaterial color={color} />
        </RoundedBox>

        {/* Skuffehåndtak */}
        <Box args={[0.2, 0.02, 0.02]} position={[-0.2 + 0.4, 0.15 + (0.5 - legHeight)/2 + 0.1, 0.23]}>
           {/* Handle positions are a bit tricky if we just grouped them, let's keep them simpler */}
        </Box>
        {/* Re-implementing drawers simpler relative to the drawer unit center */}
         <Box args={[0.2, 0.02, 0.02]} position={[0, 0.1, 0.23]}>
           <meshStandardMaterial color="#666666" metalness={0.8} />
         </Box>
         <Box args={[0.2, 0.02, 0.02]} position={[0, -0.1, 0.23]}>
           <meshStandardMaterial color="#666666" metalness={0.8} />
         </Box>
      </group>
    </group>
  )
}

/**
 * Ergonomisk kontorstol med hjul
 */
export const OfficeChairAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, color = '#1a1a1a', selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 0.6
  const depth = dimensions?.depth || 0.6
  const height = dimensions?.height || 0.8 // Total height including backrest

  // Ratios based on default design
  // Seat height usually around 0.5
  const seatHeight = height * 0.5
  const seatThickness = 0.08
  const backHeight = height - seatHeight - seatThickness
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'chair' }}>
      {/* Sete */}
      <RoundedBox args={[width * 0.8, seatThickness, depth * 0.8]} radius={0.05} position={[0, seatHeight, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Ryggstøtte */}
      <RoundedBox args={[width * 0.8, backHeight, seatThickness]} radius={0.05} position={[0, seatHeight + backHeight/2 + seatThickness/2, -depth * 0.35]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Armlener */}
      <Box args={[0.06, 0.15, depth * 0.5]} position={[-width*0.4 - 0.03, seatHeight + 0.15, 0]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      <Box args={[0.06, 0.15, depth * 0.5]} position={[width*0.4 + 0.03, seatHeight + 0.15, 0]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* Sentral søyle */}
      <Cylinder args={[0.03, 0.05, seatHeight - 0.05]} position={[0, (seatHeight - 0.05)/2 + 0.02, 0]}>
        <meshStandardMaterial color="#666666" metalness={0.8} />
      </Cylinder>
      
      {/* Base med hjul */}
      <group position={[0, 0.02, 0]}>
        {/* 5 hjularmer */}
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          const armLen = width * 0.4
          const x = Math.cos(rad) * armLen
          const z = Math.sin(rad) * armLen
          return (
            <group key={i}>
              <Box args={[0.03, 0.02, armLen]} position={[x/2, 0, z/2]} rotation={[0, rad, 0]}>
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
export const SofaAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, color = '#2563eb', selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 2.2
  const depth = dimensions?.depth || 0.9
  const height = dimensions?.height || 0.8

  const seatHeight = height * 0.4
  const backHeight = height - seatHeight
  const armWidth = width * 0.1
  const seatWidth = width - 2 * armWidth
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'sofa' }}>
      {/* Base/sete */}
      <RoundedBox args={[width, seatHeight, depth]} radius={0.05} position={[0, seatHeight/2, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Ryggstøtte */}
      <RoundedBox args={[width, backHeight, depth * 0.2]} radius={0.05} position={[0, seatHeight + backHeight/2, -depth*0.4]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Armlener */}
      <RoundedBox args={[armWidth, height * 0.6, depth]} radius={0.05} position={[-width/2 + armWidth/2, height*0.3, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      <RoundedBox args={[armWidth, height * 0.6, depth]} radius={0.05} position={[width/2 - armWidth/2, height*0.3, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Puter */}
      <RoundedBox args={[seatWidth/2 - 0.05, 0.15, depth * 0.4]} radius={0.08} position={[-seatWidth/4, seatHeight + 0.05, 0.1]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.2)} />
      </RoundedBox>
      <RoundedBox args={[seatWidth/2 - 0.05, 0.15, depth * 0.4]} radius={0.08} position={[seatWidth/4, seatHeight + 0.05, 0.1]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.2)} />
      </RoundedBox>
      
      {/* Ben */}
      <Cylinder args={[0.04, 0.04, 0.15]} position={[-width/2 + 0.1, 0.075, -depth/2 + 0.1]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.15]} position={[width/2 - 0.1, 0.075, -depth/2 + 0.1]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.15]} position={[-width/2 + 0.1, 0.075, depth/2 - 0.1]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
      <Cylinder args={[0.04, 0.04, 0.15]} position={[width/2 - 0.1, 0.075, depth/2 - 0.1]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
    </group>
  )
}

/**
 * Bokhylle med hyller
 */
export const BookshelfAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, color = '#6b4423', selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 1.25
  const depth = dimensions?.depth || 0.35
  const height = dimensions?.height || 1.8

  const thickness = 0.05
  const shelfWidth = width - 2 * thickness
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'bookshelf' }}>
      {/* Siderammer */}
      <Box args={[thickness, height, depth]} position={[-width/2 + thickness/2, height/2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[thickness, height, depth]} position={[width/2 - thickness/2, height/2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Topp og bunn */}
      <Box args={[width, thickness, depth]} position={[0, thickness/2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[width, thickness, depth]} position={[0, height - thickness/2, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      
      {/* Bakplate */}
      <Box args={[width - 0.02, height - 0.02, 0.02]} position={[0, height/2, -depth/2 + 0.01]}>
        <meshStandardMaterial color={new THREE.Color(color).lerp(new THREE.Color('#000000'), 0.2)} />
      </Box>
      
      {/* Hyller */}
      {[0.25, 0.5, 0.75].map((ratio, i) => (
        <Box key={i} args={[shelfWidth, 0.03, depth - 0.02]} position={[0, height * ratio, 0]}>
          <meshStandardMaterial color={color} />
        </Box>
      ))}
      
      {/* Bøker som dekorasjon */}
      {[
        { pos: [-width*0.2, height * 0.8, 0], color: '#ff4444' },
        { pos: [-width*0.1, height * 0.8, 0], color: '#44ff44' },
        { pos: [width*0.1, height * 0.8, 0], color: '#4444ff' },
        { pos: [width*0.2, height * 0.8, 0], color: '#ffff44' },
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
export const MeetingTableAsset = ({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], dimensions, color = '#654321', selected = false }) => {
  const groupRef = useRef()
  const width = dimensions?.width || 2.4
  const depth = dimensions?.depth || 1.2
  const height = dimensions?.height || 0.75

  const thickness = 0.08
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale} userData={{ isAsset: true, type: 'meetingTable' }}>
      {/* Bordplate */}
      <RoundedBox args={[width, thickness, depth]} radius={0.1} position={[0, height - thickness/2, 0]}>
        <meshStandardMaterial color={color} />
      </RoundedBox>
      
      {/* Sentral støtte */}
      <Cylinder args={[depth * 0.3, depth * 0.4, 0.05]} position={[0, 0.025, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </Cylinder>
      
      {/* Vertikal søyle */}
      <Cylinder args={[depth * 0.1, depth * 0.1, height - thickness]} position={[0, (height - thickness)/2, 0]}>
        <meshStandardMaterial color="#333333" metalness={0.8} />
      </Cylinder>
      
      {/* Glasstop (valgfritt) */}
      <Box args={[width - 0.05, 0.005, depth - 0.05]} position={[0, height + 0.0025, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} metalness={1} roughness={0} />
      </Box>
    </group>
  )
}
