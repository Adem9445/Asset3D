import express from 'express'
import { query } from '../db/init.js'
import mockDB from '../db/mockData.js'

const router = express.Router()

const isMockDb = () => process.env.USE_MOCK_DB === 'true'

// Get all rooms for a floor
router.get('/:floorId/rooms', async (req, res) => {
    try {
        if (isMockDb()) {
            // Verify floor exists and belongs to user's tenant
            const floor = mockDB.floors.find(f => f.id === req.params.floorId)

            if (!floor) {
                return res.status(404).json({ message: 'Etasje ikke funnet' })
            }

            // Verify location ownership
            const location = mockDB.locations.find(
                l => l.id === floor.location_id && l.tenant_id === req.user.tenantId
            )

            if (!location) {
                return res.status(403).json({ message: 'Ingen tilgang til denne etasjen' })
            }

            // Get rooms for this floor with their assets
            const rooms = mockDB.rooms
                .filter(r => r.floor_id === req.params.floorId)
                .map(room => {
                    // Get assets for this room
                    const assets = mockDB.assets.filter(a => a.room_id === room.id)
                    return {
                        ...room,
                        assets
                    }
                })
                .sort((a, b) => a.name.localeCompare(b.name))

            return res.json(rooms)
        }

        // For real database
        const { rows } = await query(
            `SELECT r.*, 
              COALESCE(json_agg(
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'type', a.asset_type,
                  'position', a.position,
                  'rotation', a.rotation,
                  'scale', a.scale
                )
              ) FILTER (WHERE a.id IS NOT NULL), '[]') as assets
       FROM rooms r
       LEFT JOIN assets a ON r.id = a.room_id
       WHERE r.floor_id = $1
       GROUP BY r.id
       ORDER BY r.name`,
            [req.params.floorId]
        )

        res.json(rows)
    } catch (error) {
        console.error('Get rooms error:', error)
        res.status(500).json({ message: 'Kunne ikke hente rom' })
    }
})

// Get single room
router.get('/:floorId/rooms/:roomId', async (req, res) => {
    try {
        if (isMockDb()) {
            const room = mockDB.rooms.find(
                r => r.id === req.params.roomId && r.floor_id === req.params.floorId
            )

            if (!room) {
                return res.status(404).json({ message: 'Rom ikke funnet' })
            }

            // Verify ownership
            const floor = mockDB.floors.find(f => f.id === room.floor_id)
            const location = mockDB.locations.find(
                l => l.id === floor.location_id && l.tenant_id === req.user.tenantId
            )

            if (!location) {
                return res.status(403).json({ message: 'Ingen tilgang til dette rommet' })
            }

            // Get assets for this room
            const assets = mockDB.assets.filter(a => a.room_id === room.id)

            return res.json({ ...room, assets })
        }

        const { rows } = await query(
            `SELECT r.*, 
              COALESCE(json_agg(
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'type', a.asset_type,
                  'position', a.position,
                  'rotation', a.rotation,
                  'scale', a.scale
                )
              ) FILTER (WHERE a.id IS NOT NULL), '[]') as assets
       FROM rooms r
       LEFT JOIN assets a ON r.id = a.room_id
       WHERE r.id = $1 AND r.floor_id = $2
       GROUP BY r.id`,
            [req.params.roomId, req.params.floorId]
        )

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Rom ikke funnet' })
        }

        res.json(rows[0])
    } catch (error) {
        console.error('Get room error:', error)
        res.status(500).json({ message: 'Kunne ikke hente rom' })
    }
})

// Update room
router.put('/:floorId/rooms/:roomId', async (req, res) => {
    try {
        const { name, room_type, dimensions, position, walls } = req.body

        if (isMockDb()) {
            const roomIndex = mockDB.rooms.findIndex(
                r => r.id === req.params.roomId && r.floor_id === req.params.floorId
            )

            if (roomIndex === -1) {
                return res.status(404).json({ message: 'Rom ikke funnet' })
            }

            // Verify ownership
            const floor = mockDB.floors.find(f => f.id === req.params.floorId)
            const location = mockDB.locations.find(
                l => l.id === floor.location_id && l.tenant_id === req.user.tenantId
            )

            if (!location) {
                return res.status(403).json({ message: 'Ingen tilgang til dette rommet' })
            }

            // Update room
            mockDB.rooms[roomIndex] = {
                ...mockDB.rooms[roomIndex],
                name: name || mockDB.rooms[roomIndex].name,
                room_type: room_type || mockDB.rooms[roomIndex].room_type,
                dimensions: dimensions || mockDB.rooms[roomIndex].dimensions,
                position: position || mockDB.rooms[roomIndex].position,
                walls: walls || mockDB.rooms[roomIndex].walls,
                updated_at: new Date().toISOString()
            }

            return res.json(mockDB.rooms[roomIndex])
        }

        const { rows } = await query(
            `UPDATE rooms 
       SET name = COALESCE($1, name),
           room_type = COALESCE($2, room_type),
           dimensions = COALESCE($3, dimensions),
           position = COALESCE($4, position),
           walls = COALESCE($5, walls),
           updated_at = NOW()
       WHERE id = $6 AND floor_id = $7
       RETURNING *`,
            [name, room_type, dimensions, position, walls, req.params.roomId, req.params.floorId]
        )

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Rom ikke funnet' })
        }

        res.json(rows[0])
    } catch (error) {
        console.error('Update room error:', error)
        res.status(500).json({ message: 'Kunne ikke oppdatere rom' })
    }
})

// Delete room
router.delete('/:floorId/rooms/:roomId', async (req, res) => {
    try {
        if (isMockDb()) {
            const roomIndex = mockDB.rooms.findIndex(
                r => r.id === req.params.roomId && r.floor_id === req.params.floorId
            )

            if (roomIndex === -1) {
                return res.status(404).json({ message: 'Rom ikke funnet' })
            }

            // Verify ownership
            const floor = mockDB.floors.find(f => f.id === req.params.floorId)
            const location = mockDB.locations.find(
                l => l.id === floor.location_id && l.tenant_id === req.user.tenantId
            )

            if (!location) {
                return res.status(403).json({ message: 'Ingen tilgang til dette rommet' })
            }

            // Delete associated assets
            mockDB.assets = mockDB.assets.filter(a => a.room_id !== req.params.roomId)

            // Delete room
            mockDB.rooms.splice(roomIndex, 1)

            return res.json({ message: 'Rom slettet' })
        }

        const { rowCount } = await query(
            'DELETE FROM rooms WHERE id = $1 AND floor_id = $2',
            [req.params.roomId, req.params.floorId]
        )

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Rom ikke funnet' })
        }

        res.json({ message: 'Rom slettet' })
    } catch (error) {
        console.error('Delete room error:', error)
        res.status(500).json({ message: 'Kunne ikke slette rom' })
    }
})

export default router
