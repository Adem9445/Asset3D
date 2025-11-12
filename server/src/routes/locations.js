import express from 'express'
import { query } from '../db/init.js'

const router = express.Router()

// Get all locations for tenant
router.get('/', async (req, res) => {
  try {
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
    
    // Get rooms for each floor
    for (const floor of floors) {
      const { rows: rooms } = await query(
        'SELECT * FROM rooms WHERE floor_id = $1 ORDER BY name',
        [floor.id]
      )
      floor.rooms = rooms
    }
    
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
