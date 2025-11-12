import express from 'express'
import pool from '../db/db.js'

const router = express.Router()

// Get all assets for tenant
router.get('/', async (req, res) => {
  try {
    const { roomId, categoryId } = req.query
    
    // Always use mock data for demo purposes (can be replaced with real DB when ready)
    const useMockData = true // Change to false when you have real data in database
    
    if (process.env.USE_MOCK_DB === 'true' || useMockData) {
      const mockAssets = [
        { 
          id: 1, 
          name: 'Ergonomisk kontorstol', 
          category_id: 1,
          category_name: 'Møbler', 
          room_id: 1,
          room_name: 'Kontor 101',
          purchase_price: 4500,
          tenant_id: req.user.tenant_id,
          asset_type: 'chair',
          status: 'active',
          created_at: new Date('2024-01-15').toISOString()
        },
        { 
          id: 2, 
          name: 'Hev/senk skrivebord', 
          category_id: 1,
          category_name: 'Møbler', 
          room_id: 1,
          room_name: 'Kontor 101',
          purchase_price: 12000,
          tenant_id: req.user.tenant_id,
          asset_type: 'desk',
          status: 'active',
          created_at: new Date('2024-01-15').toISOString()
        },
        { 
          id: 3, 
          name: 'MacBook Pro 16"', 
          category_id: 2,
          category_name: 'IT Utstyr', 
          room_id: 2,
          room_name: 'Kontor 102',
          purchase_price: 28000,
          tenant_id: req.user.tenant_id,
          asset_type: 'computer',
          status: 'active',
          created_at: new Date('2024-02-01').toISOString()
        },
        {
          id: 4,
          name: 'Kaffemaskin Delonghi',
          category_id: 4,
          category_name: 'Kjøkkenutstyr',
          room_id: 3,
          room_name: 'Kjøkken',
          purchase_price: 8500,
          tenant_id: req.user.tenant_id,
          asset_type: 'coffee_machine',
          status: 'active',
          created_at: new Date('2024-02-10').toISOString()
        },
        {
          id: 5,
          name: 'Whiteboard 200x120',
          category_id: 3,
          category_name: 'Kontorutstyr',
          room_id: 4,
          room_name: 'Møterom',
          purchase_price: 3200,
          tenant_id: req.user.tenant_id,
          asset_type: 'whiteboard',
          status: 'active',
          created_at: new Date('2024-02-15').toISOString()
        },
        {
          id: 6,
          name: 'Projektor BenQ',
          category_id: 2,
          category_name: 'IT Utstyr',
          room_id: 4,
          room_name: 'Møterom',
          purchase_price: 12500,
          tenant_id: req.user.tenant_id,
          asset_type: 'projector',
          status: 'active',
          created_at: new Date('2024-03-01').toISOString()
        },
        {
          id: 7,
          name: 'Sofa 3-seter',
          category_id: 1,
          category_name: 'Møbler',
          room_id: 5,
          room_name: 'Lounge',
          purchase_price: 15000,
          tenant_id: req.user.tenant_id,
          asset_type: 'sofa',
          status: 'active',
          created_at: new Date('2024-03-10').toISOString()
        },
        {
          id: 8,
          name: 'Kjøleskap Samsung',
          category_id: 4,
          category_name: 'Kjøkkenutstyr',
          room_id: 3,
          room_name: 'Kjøkken',
          purchase_price: 9800,
          tenant_id: req.user.tenant_id,
          asset_type: 'refrigerator',
          status: 'active',
          created_at: new Date('2024-03-15').toISOString()
        }
      ]
      
      let filtered = mockAssets
      if (roomId) filtered = filtered.filter(a => a.room_id == roomId)
      if (categoryId) filtered = filtered.filter(a => a.category_id == categoryId)
      
      return res.json(filtered)
    }
    
    // Real database query
    let queryStr = `
      SELECT a.*, c.name as category_name, r.name as room_name
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE a.tenant_id = $1
    `
    const params = [req.user.tenant_id]
    
    if (roomId) {
      queryStr += ' AND a.room_id = $2'
      params.push(roomId)
    }
    
    if (categoryId) {
      queryStr += ` AND a.category_id = $${params.length + 1}`
      params.push(categoryId)
    }
    
    queryStr += ' ORDER BY a.created_at DESC'
    
    const { rows } = await pool.query(queryStr, params)
    res.json(rows)
  } catch (error) {
    console.error('Get assets error:', error)
    res.status(500).json({ message: 'Kunne ikke hente eiendeler' })
  }
})

// Get asset categories
router.get('/categories', async (req, res) => {
  try {
    // Check if using mock database
    if (process.env.USE_MOCK_DB === 'true') {
      const mockCategories = [
        { id: 1, name: 'Møbler', icon: 'sofa' },
        { id: 2, name: 'IT Utstyr', icon: 'computer' },
        { id: 3, name: 'Kontorutstyr', icon: 'briefcase' },
        { id: 4, name: 'Kjøkkenutstyr', icon: 'coffee' },
        { id: 5, name: 'Diverse', icon: 'package' }
      ]
      return res.json(mockCategories)
    }
    
    const { rows } = await pool.query(
      'SELECT * FROM asset_categories ORDER BY name'
    )
    res.json(rows)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ message: 'Kunne ikke hente kategorier' })
  }
})

// Get single asset
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, c.name as category_name, r.name as room_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE a.id = $1 AND a.tenant_id = $2`,
      [req.params.id, req.user.tenant_id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Eiendel ikke funnet' })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error('Get asset error:', error)
    res.status(500).json({ message: 'Kunne ikke hente eiendel' })
  }
})

// Create new asset
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      roomId,
      assetType,
      purchasePrice,
      position,
      rotation,
      scale,
      metadata
    } = req.body
    
    const { rows } = await pool.query(
      `INSERT INTO assets (
        tenant_id, name, description, category_id, room_id,
        asset_type, purchase_price, position, rotation, scale, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.tenant_id,
        name,
        description,
        categoryId,
        roomId,
        assetType,
        purchasePrice,
        position || { x: 0, y: 0, z: 0 },
        rotation || { x: 0, y: 0, z: 0 },
        scale || { x: 1, y: 1, z: 1 },
        metadata || {}
      ]
    )
    
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Create asset error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette eiendel' })
  }
})

// Update asset position/rotation/scale
router.patch('/:id/transform', async (req, res) => {
  try {
    const { position, rotation, scale } = req.body
    
    const { rows } = await pool.query(
      `UPDATE assets
       SET position = $1, rotation = $2, scale = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [position, rotation, scale, req.params.id, req.user.tenant_id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Eiendel ikke funnet' })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error('Update asset transform error:', error)
    res.status(500).json({ message: 'Kunne ikke oppdatere eiendel' })
  }
})

// Move asset to different room
router.patch('/:id/move', async (req, res) => {
  try {
    const { roomId } = req.body
    
    const { rows } = await pool.query(
      `UPDATE assets
       SET room_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [roomId, req.params.id, req.user.tenant_id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Eiendel ikke funnet' })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error('Move asset error:', error)
    res.status(500).json({ message: 'Kunne ikke flytte eiendel' })
  }
})

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM assets WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.user.tenant_id]
    )
    
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Eiendel ikke funnet' })
    }
    
    res.json({ message: 'Eiendel slettet' })
  } catch (error) {
    console.error('Delete asset error:', error)
    res.status(500).json({ message: 'Kunne ikke slette eiendel' })
  }
})

export default router
