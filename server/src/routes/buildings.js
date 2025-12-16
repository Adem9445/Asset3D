import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool, { query } from '../db/init.js'
import mockDB from '../db/mockData.js'

const router = express.Router()
const isMockDb = () => process.env.USE_MOCK_DB === 'true'

const createFloorStructure = (rooms = [], floorDefinitions = []) => {
  if ((!rooms || rooms.length === 0) && Array.isArray(floorDefinitions) && floorDefinitions.length > 0) {
    return floorDefinitions.map((floor, index) => ({
      id: floor.id || `floor-${index + 1}`,
      name: floor.name || `${index + 1}. etasje`,
      number: floor.number ?? floor.floor_number ?? floor.level ?? (index + 1),
      rooms: [],
      assetCount: 0
    }))
  }

  if (!rooms || rooms.length === 0) {
    return []
  }

  const buckets = new Map()

  rooms.forEach(room => {
    const floorNumber = Number.isFinite(room.floor_number)
      ? room.floor_number
      : Number.isFinite(room.floor)
        ? room.floor
        : 1

    const normalizedFloor = floorNumber || 1
    const bucket = buckets.get(normalizedFloor) || {
      id: `floor-${normalizedFloor}`,
      name: `${normalizedFloor}. etasje`,
      number: normalizedFloor,
      rooms: []
    }

    const assets = room.assets || []
    bucket.rooms.push({
      id: room.id,
      name: room.name,
      type: room.type,
      floor: normalizedFloor,
      assetCount: assets.length
    })
    buckets.set(normalizedFloor, bucket)
  })

  let floors = []

  if (Array.isArray(floorDefinitions) && floorDefinitions.length > 0) {
    floors = floorDefinitions.map((floor, index) => {
      const number = floor.number ?? floor.floor_number ?? floor.level ?? (index + 1)
      const bucket = buckets.get(number)
      const roomsForFloor = bucket ? bucket.rooms : []

      return {
        id: floor.id || `floor-${number}`,
        name: floor.name || `${number}. etasje`,
        number,
        rooms: roomsForFloor,
        assetCount: roomsForFloor.reduce((sum, room) => sum + room.assetCount, 0)
      }
    })

    const definedNumbers = new Set(floors.map(floor => floor.number))
    buckets.forEach((bucket, number) => {
      if (!definedNumbers.has(number)) {
        floors.push({
          id: bucket.id,
          name: bucket.name,
          number,
          rooms: bucket.rooms,
          assetCount: bucket.rooms.reduce((sum, room) => sum + room.assetCount, 0)
        })
      }
    })

    return floors.sort((a, b) => a.number - b.number)
  }

  floors = Array.from(buckets.values()).map(bucket => ({
    ...bucket,
    assetCount: bucket.rooms.reduce((sum, room) => sum + room.assetCount, 0)
  }))

  return floors.sort((a, b) => a.number - b.number)
}

const buildMockBuilding = (building, tenantId) => {
  const rooms = mockDB.rooms
    .filter(room => room.building_id === building.id && room.tenant_id === tenantId)
    .map(room => ({
      ...room,
      assets: mockDB.assets
        .filter(asset => asset.room_id === room.id && asset.tenant_id === tenantId)
        .map(asset => ({
          ...asset,
          category_name: mockDB.categories.find(category => category.id === asset.category_id)?.name || null
        }))
    }))

  return {
    ...building,
    rooms,
    floors: createFloorStructure(rooms, building.data?.floors)
  }
}

const buildDatabaseBuilding = async (building, tenantId) => {
  const roomsResult = await query(
    `SELECT * FROM rooms WHERE building_id = $1 ORDER BY floor_number, name`,
    [building.id]
  )

  const roomIds = roomsResult.rows.map(r => r.id)
  let allAssets = []

  if (roomIds.length > 0) {
    const assetResult = await query(
      `SELECT a.*, c.name as category_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       WHERE a.room_id = ANY($1) AND a.tenant_id = $2
       ORDER BY a.created_at DESC`,
      [roomIds, tenantId]
    )
    allAssets = assetResult.rows
  }

  // Group assets by room_id
  const assetsByRoom = new Map()
  allAssets.forEach(asset => {
    if (!assetsByRoom.has(asset.room_id)) {
      assetsByRoom.set(asset.room_id, [])
    }
    assetsByRoom.get(asset.room_id).push(asset)
  })

  const rooms = roomsResult.rows.map(room => ({
    ...room,
    assets: assetsByRoom.get(room.id) || []
  }))

  return {
    ...building,
    rooms,
    floors: createFloorStructure(rooms, building.data?.floors)
  }
}

export { buildDatabaseBuilding }

/**
 * Get all buildings for tenant
 */
router.get('/', async (req, res) => {
  try {
    console.log('GET /buildings - Start', { user: req.user })
    if (isMockDb()) {
      const tenantId = String(req.user.tenantId)
      const buildings = mockDB.buildings
        .filter(item => item.tenant_id === tenantId)
        .map(building => buildMockBuilding(building, tenantId))

      return res.json(buildings)
    }

    console.log('GET /buildings - Querying database for tenant:', req.user.tenantId)
    const result = await query(
      `SELECT * FROM buildings
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [req.user.tenantId]
    )
    console.log('GET /buildings - Query result:', result.rowCount)

    const buildings = await Promise.all(
      result.rows.map(async (building) => {
        try {
          return await buildDatabaseBuilding(building, req.user.tenantId)
        } catch (err) {
          console.error('Error building database building:', err)
          throw err
        }
      })
    )
    console.log('GET /buildings - Buildings built:', buildings.length)

    res.json(buildings)
  } catch (error) {
    console.error('Error fetching buildings:', error)
    res.status(500).json({ message: 'Feil ved henting av bygninger', error: error.message })
  }
})

/**
 * Get single building by ID
 */
router.get('/:id', async (req, res) => {
  try {
    if (isMockDb()) {
      const tenantId = String(req.user.tenantId)
      const building = mockDB.buildings.find(
        item => item.id === req.params.id && item.tenant_id === tenantId
      )

      if (!building) {
        return res.status(404).json({ message: 'Bygning ikke funnet' })
      }

      return res.json(buildMockBuilding(building, tenantId))
    }

    const result = await query(
      `SELECT * FROM buildings
       WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bygning ikke funnet' })
    }

    const building = await buildDatabaseBuilding(result.rows[0], req.user.tenantId)

    res.json(building)
  } catch (error) {
    console.error('Error fetching building:', error)
    res.status(500).json({ message: 'Feil ved henting av bygning' })
  }
})

/**
 * Save/Update building with all data
 */
router.post('/save', async (req, res) => {
  if (isMockDb()) {
    const { id, name, address, floors, rooms } = req.body
    const tenantId = String(req.user.tenantId)

    let buildingId = id
    const timestamp = new Date().toISOString()

    if (buildingId) {
      const existing = mockDB.buildings.find(
        item => item.id === buildingId && item.tenant_id === tenantId
      )

      if (!existing) {
        return res.status(404).json({ message: 'Bygning ikke funnet' })
      }

      existing.name = name
      existing.address = address
      existing.data = { floors }
      existing.updated_at = timestamp
    } else {
      buildingId = `mock-building-${Date.now()}`
      mockDB.buildings.push({
        id: buildingId,
        tenant_id: tenantId,
        name,
        address,
        data: { floors },
        created_at: timestamp,
        updated_at: timestamp,
        created_by: req.user.id
      })
    }

    const existingRoomIds = new Set(
      mockDB.rooms
        .filter(room => room.building_id === buildingId)
        .map(room => room.id)
    )

    mockDB.assets = mockDB.assets.filter(asset => !existingRoomIds.has(asset.room_id))
    mockDB.rooms = mockDB.rooms.filter(room => room.building_id !== buildingId)

    if (rooms?.length) {
      rooms.forEach(room => {
        const roomId = room.id || `mock-room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

        mockDB.rooms.push({
          id: roomId,
          building_id: buildingId,
          tenant_id: tenantId,
          name: room.name,
          type: room.type,
          floor_number: room.floor || 1,
          data: room.data || null
        })

        if (room.assets?.length) {
          room.assets.forEach(asset => {
            mockDB.assets.push({
              id: asset.id || `mock-asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              tenant_id: tenantId,
              name: asset.name,
              description: asset.description,
              category_id: asset.categoryId || asset.category_id || '5',
              room_id: roomId,
              asset_type: asset.type || asset.asset_type,
              purchase_price: asset.purchase_price || asset.purchasePrice || 0,
              position: asset.position,
              rotation: asset.rotation,
              scale: asset.scale,
              metadata: asset.metadata || {},
              status: asset.status || 'active',
              created_at: asset.created_at || timestamp,
              updated_at: timestamp
            })
          })
        }
      })
    }

    return res.json({
      success: true,
      id: buildingId,
      message: 'Bygning lagret'
    })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const { id, name, address, floors, rooms } = req.body

    // Upsert building
    let buildingId = id

    if (id) {
      // Update existing building
      await client.query(
        `UPDATE buildings
         SET name = $1, address = $2, data = $3, updated_at = NOW()
         WHERE id = $4 AND tenant_id = $5`,
        [name, address, JSON.stringify({ floors }), id, req.user.tenantId]
      )
    } else {
      // Create new building
      const result = await client.query(
        `INSERT INTO buildings (tenant_id, name, address, data, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [req.user.tenantId, name, address, JSON.stringify({ floors }), req.user.id]
      )
      buildingId = result.rows[0].id
    }

    // Save rooms
    if (rooms && rooms.length > 0) {
      // Delete existing rooms and assets for this building
      await client.query(
        `DELETE FROM assets
         WHERE room_id IN (
           SELECT id FROM rooms WHERE building_id = $1
         )`,
        [buildingId]
      )

      await client.query(
        `DELETE FROM rooms WHERE building_id = $1`,
        [buildingId]
      )

      // Insert new rooms and assets
      for (const room of rooms) {
        const roomResult = await client.query(
          `INSERT INTO rooms (building_id, name, type, floor_number, data)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            buildingId,
            room.name,
            room.type,
            room.floor || 1,
            JSON.stringify({
              walls: room.walls,
              dimensions: room.dimensions
            })
          ]
        )

        const roomId = roomResult.rows[0].id

        // Insert assets for room
        if (room.assets && room.assets.length > 0) {
          for (const asset of room.assets) {
            await client.query(
              `INSERT INTO assets (
                room_id, name, type, category,
                position_x, position_y, position_z,
                rotation_x, rotation_y, rotation_z,
                scale_x, scale_y, scale_z,
                data
              ) VALUES (
                $1, $2, $3, $4,
                $5, $6, $7,
                $8, $9, $10,
                $11, $12, $13,
                $14
              )`,
              [
                roomId,
                asset.name,
                asset.type,
                asset.category,
                asset.position?.[0] || 0,
                asset.position?.[1] || 0,
                asset.position?.[2] || 0,
                asset.rotation?.[0] || 0,
                asset.rotation?.[1] || 0,
                asset.rotation?.[2] || 0,
                asset.scale?.[0] || 1,
                asset.scale?.[1] || 1,
                asset.scale?.[2] || 1,
                JSON.stringify(asset.metadata || {})
              ]
            )
          }
        }
      }
    }

    await client.query('COMMIT')

    res.json({
      success: true,
      id: buildingId,
      message: 'Bygning lagret'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error saving building:', error)
    res.status(500).json({ message: 'Feil ved lagring av bygning' })
  } finally {
    client.release()
  }
})

/**
 * Delete building
 */
router.delete('/:id', async (req, res) => {
  if (isMockDb()) {
    const tenantId = String(req.user.tenantId)
    const buildingIndex = mockDB.buildings.findIndex(
      item => item.id === req.params.id && item.tenant_id === tenantId
    )

    if (buildingIndex === -1) {
      return res.status(404).json({ message: 'Bygning ikke funnet' })
    }

    const roomIds = new Set(
      mockDB.rooms
        .filter(room => room.building_id === req.params.id)
        .map(room => room.id)
    )

    mockDB.buildings.splice(buildingIndex, 1)
    mockDB.rooms = mockDB.rooms.filter(room => room.building_id !== req.params.id)
    mockDB.assets = mockDB.assets.filter(asset => !roomIds.has(asset.room_id))

    return res.json({ success: true, message: 'Bygning slettet' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Check ownership
    const check = await client.query(
      `SELECT id FROM buildings
       WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    )

    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Bygning ikke funnet' })
    }

    // Delete assets first
    await client.query(
      `DELETE FROM assets
       WHERE room_id IN (
         SELECT id FROM rooms WHERE building_id = $1
       )`,
      [req.params.id]
    )

    // Delete rooms
    await client.query(
      `DELETE FROM rooms WHERE building_id = $1`,
      [req.params.id]
    )

    // Delete building
    await client.query(
      `DELETE FROM buildings WHERE id = $1`,
      [req.params.id]
    )

    await client.query('COMMIT')

    res.json({ success: true, message: 'Bygning slettet' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error deleting building:', error)
    res.status(500).json({ message: 'Feil ved sletting av bygning' })
  } finally {
    client.release()
  }
})

export default router
