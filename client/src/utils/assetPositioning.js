/**
 * Asset positioning utilities for collision detection and smart placement
 */

/**
 * Check if two bounding boxes overlap
 */
export const checkCollision = (box1, box2, padding = 0.2) => {
  const halfSize1 = { 
    x: (box1.width || 1) / 2 + padding, 
    z: (box1.depth || 1) / 2 + padding 
  }
  const halfSize2 = { 
    x: (box2.width || 1) / 2 + padding, 
    z: (box2.depth || 1) / 2 + padding 
  }
  
  const distance = {
    x: Math.abs(box1.position[0] - box2.position[0]),
    z: Math.abs(box1.position[2] - box2.position[2])
  }
  
  return distance.x < (halfSize1.x + halfSize2.x) && 
         distance.z < (halfSize1.z + halfSize2.z)
}

/**
 * Get default asset dimensions based on type
 */
export const getAssetDimensions = (assetType) => {
  const dimensions = {
    // Furniture
    desk: { width: 1.5, depth: 0.8, height: 0.75 },
    chair: { width: 0.6, depth: 0.6, height: 0.8 },
    sofa: { width: 2.0, depth: 0.8, height: 0.8 },
    bookshelf: { width: 1.0, depth: 0.4, height: 2.0 },
    meetingTable: { width: 2.0, depth: 1.2, height: 0.75 },
    
    // Office
    computer: { width: 0.4, depth: 0.3, height: 0.3 },
    printer: { width: 0.5, depth: 0.4, height: 0.3 },
    phone: { width: 0.2, depth: 0.2, height: 0.1 },
    whiteboard: { width: 1.5, depth: 0.1, height: 1.0 },
    filingCabinet: { width: 0.5, depth: 0.6, height: 1.2 },
    trashBin: { width: 0.3, depth: 0.3, height: 0.4 },
    
    // Kitchen
    coffeeMachine: { width: 0.3, depth: 0.3, height: 0.4 },
    microwave: { width: 0.5, depth: 0.4, height: 0.3 },
    refrigerator: { width: 0.7, depth: 0.7, height: 1.8 },
    waterCooler: { width: 0.4, depth: 0.4, height: 1.2 },
    plant: { width: 0.3, depth: 0.3, height: 0.6 },
    
    // Default
    default: { width: 0.8, depth: 0.8, height: 0.8 }
  }
  
  return dimensions[assetType] || dimensions.default
}

/**
 * Find a non-colliding position for a new asset
 */
export const findNonCollidingPosition = (
  existingAssets, 
  newAssetType,
  roomBounds = { width: 10, depth: 10 },
  maxAttempts = 50
) => {
  const newAssetDims = getAssetDimensions(newAssetType)
  
  // Try grid positions first
  const gridSize = 1.5
  const halfWidth = roomBounds.width / 2
  const halfDepth = roomBounds.depth / 2
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let position
    
    if (attempt < 20) {
      // Try regular grid positions
      const gridX = (attempt % 5 - 2) * gridSize
      const gridZ = (Math.floor(attempt / 5) - 2) * gridSize
      position = [gridX, 0, gridZ]
    } else {
      // Try random positions
      position = [
        (Math.random() - 0.5) * (roomBounds.width - newAssetDims.width),
        0,
        (Math.random() - 0.5) * (roomBounds.depth - newAssetDims.depth)
      ]
    }
    
    // Check if position is within room bounds
    if (Math.abs(position[0]) + newAssetDims.width/2 > halfWidth ||
        Math.abs(position[2]) + newAssetDims.depth/2 > halfDepth) {
      continue
    }
    
    // Check for collisions
    let hasCollision = false
    const newBox = {
      position,
      width: newAssetDims.width,
      depth: newAssetDims.depth
    }
    
    for (const asset of existingAssets) {
      const assetDims = getAssetDimensions(asset.type)
      const assetBox = {
        position: asset.position || [0, 0, 0],
        width: assetDims.width,
        depth: assetDims.depth
      }
      
      if (checkCollision(newBox, assetBox)) {
        hasCollision = true
        break
      }
    }
    
    if (!hasCollision) {
      return position
    }
  }
  
  // Fallback: place at origin with offset
  console.warn('Could not find non-colliding position, using fallback')
  return [existingAssets.length * 0.5, 0, 0]
}

/**
 * Snap position to grid
 */
export const snapToGrid = (position, gridSize = 0.25) => {
  return [
    Math.round(position[0] / gridSize) * gridSize,
    position[1], // Keep Y unchanged
    Math.round(position[2] / gridSize) * gridSize
  ]
}

/**
 * Validate and fix asset positions in a room
 */
export const validateAssetPositions = (assets, roomBounds = { width: 10, depth: 10 }) => {
  const validatedAssets = []
  const occupiedPositions = []
  
  for (const asset of assets) {
    const dims = getAssetDimensions(asset.type)
    let position = asset.position || [0, 0, 0]
    
    // Check if position is valid and non-colliding
    let needsNewPosition = false
    
    // Check bounds
    if (Math.abs(position[0]) + dims.width/2 > roomBounds.width/2 ||
        Math.abs(position[2]) + dims.depth/2 > roomBounds.depth/2) {
      needsNewPosition = true
    }
    
    // Check collisions
    if (!needsNewPosition) {
      const assetBox = { position, width: dims.width, depth: dims.depth }
      for (const occupied of occupiedPositions) {
        if (checkCollision(assetBox, occupied)) {
          needsNewPosition = true
          break
        }
      }
    }
    
    // Find new position if needed
    if (needsNewPosition) {
      position = findNonCollidingPosition(validatedAssets, asset.type, roomBounds)
    }
    
    // Add to validated list
    const validatedAsset = { ...asset, position: snapToGrid(position) }
    validatedAssets.push(validatedAsset)
    occupiedPositions.push({
      position: validatedAsset.position,
      width: dims.width,
      depth: dims.depth
    })
  }
  
  return validatedAssets
}

/**
 * Get room bounds from walls
 */
export const getRoomBoundsFromWalls = (walls) => {
  if (!walls || walls.length === 0) {
    return { width: 10, depth: 10 }
  }
  
  const allX = walls.flatMap(w => [w.start[0], w.end[0]])
  const allZ = walls.flatMap(w => [w.start[2], w.end[2]])
  
  const minX = Math.min(...allX)
  const maxX = Math.max(...allX)
  const minZ = Math.min(...allZ)
  const maxZ = Math.max(...allZ)
  
  return {
    width: maxX - minX,
    depth: maxZ - minZ,
    center: [(minX + maxX) / 2, 0, (minZ + maxZ) / 2]
  }
}
