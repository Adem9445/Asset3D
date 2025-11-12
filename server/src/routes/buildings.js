import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import pool from '../db/db.js'
import mockDB from '../db/mockData.js'

const router = express.Router()
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true'

/**
 * Get all buildings for tenant
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM buildings 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC`,
      [req.user.tenant_id]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching buildings:', error)
    res.status(500).json({ message: 'Feil ved henting av bygninger' })
  }
})

/**
 * Get single building by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM buildings 
       WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenant_id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Bygning ikke funnet' })
    }
    
    // Get rooms for building
    const roomsResult = await pool.query(
      `SELECT * FROM rooms 
       WHERE building_id = $1 
       ORDER BY floor_number, name`,
      [req.params.id]
    )
    
    // Get assets for all rooms
    const assetResults = await pool.query(
      `SELECT a.*, r.id as room_id 
       FROM assets a 
       JOIN rooms r ON a.room_id = r.id 
       WHERE r.building_id = $1`,
      [req.params.id]
    )
    
    const building = result.rows[0]
    building.rooms = roomsResult.rows.map(room => ({
      ...room,
      assets: assetResults.rows.filter(asset => asset.room_id === room.id)
    }))
    
    res.json(building)
  } catch (error) {
    console.error('Error fetching building:', error)
    res.status(500).json({ message: 'Feil ved henting av bygning' })
  }
})

/**
 * Save/Update building with all data
 */
router.post('/save', authenticateToken, async (req, res) => {
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
        [name, address, JSON.stringify({ floors }), id, req.user.tenant_id]
      )
    } else {
      // Create new building
      const result = await client.query(
        `INSERT INTO buildings (tenant_id, name, address, data, created_by) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [req.user.tenant_id, name, address, JSON.stringify({ floors }), req.user.id]
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
router.delete('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Check ownership
    const check = await client.query(
      `SELECT id FROM buildings 
       WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenant_id]
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
