import express from 'express'
import pool from '../db/db.js'
import mockDB from '../db/mockData.js'
import { z } from 'zod'

const isMockDb = () => process.env.USE_MOCK_DB === 'true'

const router = express.Router()

// Validation schemas
const transformSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
})

const createAssetSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  description: z.string().optional(),
  // IDs must be strings. UUID validation is skipped to support Demo Mode (mock-asset-1 etc)
  categoryId: z.string().min(1).optional(),
  roomId: z.string().min(1).optional(),
  assetType: z.string().optional(),
  purchasePrice: z.number().optional(),
  position: transformSchema.optional(),
  rotation: transformSchema.optional(),
  scale: transformSchema.optional(),
  metadata: z.record(z.any()).optional()
})

const updateAssetSchema = createAssetSchema.partial().extend({
  status: z.string().optional()
})

const transformUpdateSchema = z.object({
  position: transformSchema.optional(),
  rotation: transformSchema.optional(),
  scale: transformSchema.optional()
})

// Get all assets for tenant
router.get('/', async (req, res) => {
  try {
    const { roomId, categoryId } = req.query
    const tenantId = String(req.user.tenantId)

    if (isMockDb()) {
      const roomMap = new Map(
        mockDB.rooms.map(room => [room.id, room])
      )
      const categoryMap = new Map(
        mockDB.categories.map(category => [category.id, category])
      )

      const assets = mockDB.assets
        .filter(asset => asset.tenant_id === tenantId)
        .filter(asset => !roomId || asset.room_id === roomId)
        .filter(asset => !categoryId || asset.category_id === categoryId)
        .map(asset => ({
          ...asset,
          category_name: categoryMap.get(asset.category_id)?.name || 'Ukjent kategori',
          room_name: roomMap.get(asset.room_id)?.name || 'Ukjent rom'
        }))

      return res.json(assets)
    }

    // Real database query
    let queryStr = `
      SELECT a.*, c.name as category_name, r.name as room_name
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      LEFT JOIN rooms r ON a.room_id = r.id
      WHERE a.tenant_id = $1
    `
    const params = [tenantId]

    if (roomId) {
      params.push(roomId)
      queryStr += ` AND a.room_id = $${params.length}`
    }

    if (categoryId) {
      params.push(categoryId)
      queryStr += ` AND a.category_id = $${params.length}`
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
    if (isMockDb()) {
      return res.json(mockDB.categories)
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
    if (isMockDb()) {
      const asset = mockDB.assets.find(
        item => item.id === req.params.id && item.tenant_id === String(req.user.tenantId)
      )

      if (!asset) {
        return res.status(404).json({ message: 'Eiendel ikke funnet' })
      }

      const category = mockDB.categories.find(c => c.id === asset.category_id)
      const room = mockDB.rooms.find(r => r.id === asset.room_id)

      return res.json({
        ...asset,
        category_name: category?.name,
        room_name: room?.name
      })
    }

    const { rows } = await pool.query(
      `SELECT a.*, c.name as category_name, r.name as room_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE a.id = $1 AND a.tenant_id = $2`,
      [req.params.id, req.user.tenantId]
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
    const validatedData = createAssetSchema.parse(req.body)
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
    } = validatedData

    if (isMockDb()) {
      const asset = {
        id: `mock-asset-${Date.now()}`,
        tenant_id: String(req.user.tenantId),
        name,
        description,
        category_id: categoryId,
        room_id: roomId,
        asset_type: assetType,
        purchase_price: purchasePrice,
        position: position || { x: 0, y: 0, z: 0 },
        rotation: rotation || { x: 0, y: 0, z: 0 },
        scale: scale || { x: 1, y: 1, z: 1 },
        metadata: metadata || {},
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      mockDB.assets.push(asset)

      const category = mockDB.categories.find(c => c.id === categoryId)
      const room = mockDB.rooms.find(r => r.id === roomId)

      return res.status(201).json({
        ...asset,
        category_name: category?.name,
        room_name: room?.name
      })
    }

    const { rows } = await pool.query(
      `INSERT INTO assets (
        tenant_id, name, description, category_id, room_id,
        asset_type, purchase_price, position, rotation, scale, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.tenantId,
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
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Valideringsfeil',
        errors: error.errors
      })
    }
    console.error('Create asset error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette eiendel' })
  }
})

// Update asset fields
router.patch('/:id', async (req, res) => {
  try {
    const validatedData = updateAssetSchema.parse(req.body)
    const {
      name,
      description,
      categoryId,
      roomId,
      assetType,
      purchasePrice,
      status,
      metadata
    } = validatedData

    if (isMockDb()) {
      const asset = mockDB.assets.find(
        item => item.id === req.params.id && item.tenant_id === String(req.user.tenantId)
      )

      if (!asset) {
        return res.status(404).json({ message: 'Eiendel ikke funnet' })
      }

      if (name !== undefined) asset.name = name
      if (description !== undefined) asset.description = description
      if (categoryId !== undefined) asset.category_id = categoryId
      if (roomId !== undefined) asset.room_id = roomId
      if (assetType !== undefined) asset.asset_type = assetType
      if (purchasePrice !== undefined) asset.purchase_price = purchasePrice
      if (status !== undefined) asset.status = status
      if (metadata !== undefined) asset.metadata = metadata

      asset.updated_at = new Date().toISOString()

      const category = mockDB.categories.find(c => c.id === asset.category_id)
      const room = mockDB.rooms.find(r => r.id === asset.room_id)

      return res.json({
        ...asset,
        category_name: category?.name,
        room_name: room?.name
      })
    }

    const updateFields = []
    const values = []

    const addField = (field, value) => {
      values.push(value)
      updateFields.push(`${field} = $${values.length}`)
    }

    if (name !== undefined) addField('name', name)
    if (description !== undefined) addField('description', description)
    if (categoryId !== undefined) addField('category_id', categoryId)
    if (roomId !== undefined) addField('room_id', roomId)
    if (assetType !== undefined) addField('asset_type', assetType)
    if (purchasePrice !== undefined) addField('purchase_price', purchasePrice)
    if (status !== undefined) addField('status', status)
    if (metadata !== undefined) addField('metadata', metadata)

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Ingen felter å oppdatere' })
    }

    const query = `
      UPDATE assets
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length + 1} AND tenant_id = $${values.length + 2}
      RETURNING id
    `

    values.push(req.params.id, req.user.tenantId)

    const { rows } = await pool.query(query, values)

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Eiendel ikke funnet' })
    }

    const detail = await pool.query(
      `SELECT a.*, c.name as category_name, r.name as room_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       LEFT JOIN rooms r ON a.room_id = r.id
       WHERE a.id = $1 AND a.tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    )

    res.json(detail.rows[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Valideringsfeil',
        errors: error.errors
      })
    }
    console.error('Update asset error:', error)
    res.status(500).json({ message: 'Kunne ikke oppdatere eiendel' })
  }
})

// Update asset position/rotation/scale
router.patch('/:id/transform', async (req, res) => {
  try {
    const validatedData = transformUpdateSchema.parse(req.body)
    const { position, rotation, scale } = validatedData
    
    if (isMockDb()) {
      const asset = mockDB.assets.find(
        item => item.id === req.params.id && item.tenant_id === String(req.user.tenantId)
      )

      if (!asset) {
        return res.status(404).json({ message: 'Eiendel ikke funnet' })
      }

      asset.position = position || asset.position
      asset.rotation = rotation || asset.rotation
      asset.scale = scale || asset.scale
      asset.updated_at = new Date().toISOString()

      return res.json(asset)
    }

    const { rows } = await pool.query(
      `UPDATE assets
       SET position = $1, rotation = $2, scale = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [position, rotation, scale, req.params.id, req.user.tenantId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Eiendel ikke funnet' })
    }

    res.json(rows[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Valideringsfeil',
        errors: error.errors
      })
    }
    console.error('Update asset transform error:', error)
    res.status(500).json({ message: 'Kunne ikke oppdatere eiendel' })
  }
})

// Move asset to different room
router.patch('/:id/move', async (req, res) => {
  try {
    const { roomId } = req.body
    
    if (!roomId) {
      return res.status(400).json({ message: 'Rom ID mangler' })
    }

    if (isMockDb()) {
      const asset = mockDB.assets.find(
        item => item.id === req.params.id && item.tenant_id === String(req.user.tenantId)
      )

      if (!asset) {
        return res.status(404).json({ message: 'Eiendel ikke funnet' })
      }

      asset.room_id = roomId
      asset.updated_at = new Date().toISOString()

      const room = mockDB.rooms.find(r => r.id === roomId)

      return res.json({
        ...asset,
        room_name: room?.name
      })
    }

    const { rows } = await pool.query(
      `UPDATE assets
       SET room_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [roomId, req.params.id, req.user.tenantId]
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
    if (isMockDb()) {
      const index = mockDB.assets.findIndex(
        item => item.id === req.params.id && item.tenant_id === String(req.user.tenantId)
      )

      if (index === -1) {
        return res.status(404).json({ message: 'Eiendel ikke funnet' })
      }

      mockDB.assets.splice(index, 1)
      return res.json({ message: 'Eiendel slettet' })
    }

    const { rowCount } = await pool.query(
      'DELETE FROM assets WHERE id = $1 AND tenant_id = $2',
      [req.params.id, req.user.tenantId]
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
