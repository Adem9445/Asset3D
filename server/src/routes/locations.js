import express from 'express'
import { query } from '../db/init.js'
import mockDB from '../db/mockData.js'

const router = express.Router()

const isMockDb = () => process.env.USE_MOCK_DB === 'true'

// Get all locations for tenant
router.get('/', async (req, res) => {
  try {
    if (isMockDb()) {
      // In mock mode, we need to count floors for each location
      const locations = mockDB.locations
        .filter(l => l.tenant_id === req.user.tenantId)
        .map(l => {
          // Find floors for this location
          const floors = mockDB.floors.filter(f => f.location_id === l.id)
          return {
            ...l,
            floor_count: floors.length
          }
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      return res.json(locations)
    }

    const { rows } = await query(
      `SELECT l.*, COUNT(DISTINCT f.id) as floor_count
       FROM locations l
       LEFT JOIN floors f ON l.id = f.location_id
       WHERE l.tenant_id = $1
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.user.tenantId]
    )
    res.json(rows)
  } catch (error) {
    console.error('Get locations error:', error)
    res.status(500).json({ message: 'Kunne ikke hente lokasjoner' })
  }
})

// Get single location with floors and rooms
router.get('/:id', async (req, res) => {
  try {
    if (isMockDb()) {
      const location = mockDB.locations.find(
        l => l.id === req.params.id && l.tenant_id === req.user.tenantId
      )

      if (!location) {
        return res.status(404).json({ message: 'Lokasjon ikke funnet' })
      }

      // Get floors
      const floors = mockDB.floors
        .filter(f => f.location_id === location.id)
        .sort((a, b) => a.floor_number - b.floor_number)
        .map(f => {
          // Get rooms for each floor
          const rooms = mockDB.rooms
            .filter(r => r.floor_id === f.id)
            .sort((a, b) => a.name.localeCompare(b.name))

          return { ...f, rooms }
        })

      return res.json({ ...location, floors })
    }

    const { rows: location } = await query(
      'SELECT * FROM locations WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.user.tenantId]
    )
    
    if (location.length === 0) {
      return res.status(404).json({ message: 'Lokasjon ikke funnet' })
    }
    
    // Get floors
    const { rows: floors } = await query(
      'SELECT * FROM floors WHERE location_id = $1 ORDER BY floor_number',
      [req.params.id]
    )
    
    // Get all rooms for these floors in one query (N+1 optimization)
    const floorIds = floors.map(f => f.id)
    let allRooms = []

    if (floorIds.length > 0) {
      const { rows } = await query(
        'SELECT * FROM rooms WHERE floor_id = ANY($1) ORDER BY name',
        [floorIds]
      )
      allRooms = rows
    }

    // Map rooms to floors
    floors.forEach(floor => {
      floor.rooms = allRooms.filter(r => r.floor_id === floor.id)
    })
    
    res.json({ ...location[0], floors })
  } catch (error) {
    console.error('Get location error:', error)
    res.status(500).json({ message: 'Kunne ikke hente lokasjon' })
  }
})

// Create new location
router.post('/', async (req, res) => {
  try {
    const { name, address, postalCode, city } = req.body
    
    if (isMockDb()) {
      const newLocation = {
        id: `mock-loc-${Date.now()}`,
        tenant_id: req.user.tenantId,
        name,
        address,
        postal_code: postalCode,
        city,
        country: 'Norge',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockDB.locations.push(newLocation)
      return res.status(201).json(newLocation)
    }

    const { rows } = await query(
      `INSERT INTO locations (tenant_id, name, address, postal_code, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.tenantId, name, address, postalCode, city]
    )
    
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Create location error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette lokasjon' })
  }
})

// Add floor to location
router.post('/:id/floors', async (req, res) => {
  try {
    const { name, floorNumber } = req.body
    
    if (isMockDb()) {
      const location = mockDB.locations.find(
        l => l.id === req.params.id && l.tenant_id === req.user.tenantId
      )

      if (!location) {
        return res.status(404).json({ message: 'Lokasjon ikke funnet' })
      }

      const newFloor = {
        id: `mock-floor-${Date.now()}`,
        location_id: req.params.id,
        name,
        floor_number: floorNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockDB.floors.push(newFloor)
      return res.status(201).json(newFloor)
    }

    const { rows } = await query(
      `INSERT INTO floors (location_id, name, floor_number)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, name, floorNumber]
    )
    
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Create floor error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette etasje' })
  }
})

// Add room to floor
router.post('/:locationId/floors/:floorId/rooms', async (req, res) => {
  try {
    const { name, roomType, dimensions, position } = req.body
    
    if (isMockDb()) {
      // Verify location ownership
      const location = mockDB.locations.find(
        l => l.id === req.params.locationId && l.tenant_id === req.user.tenantId
      )

      if (!location) {
        return res.status(404).json({ message: 'Lokasjon ikke funnet' })
      }

      // Verify floor belongs to location
      const floor = mockDB.floors.find(
        f => f.id === req.params.floorId && f.location_id === req.params.locationId
      )

      if (!floor) {
        return res.status(404).json({ message: 'Etasje ikke funnet' })
      }

      const newRoom = {
        id: `mock-room-${Date.now()}`,
        floor_id: req.params.floorId,
        name,
        room_type: roomType,
        dimensions: dimensions || {},
        position: position || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockDB.rooms.push(newRoom)
      return res.status(201).json(newRoom)
    }

    const { rows } = await query(
      `INSERT INTO rooms (floor_id, name, room_type, dimensions, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.floorId, name, roomType, dimensions, position]
    )
    
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Create room error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette rom' })
  }
})

export default router
