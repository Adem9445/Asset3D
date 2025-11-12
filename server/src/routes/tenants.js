import express from 'express'
import { query } from '../db/init.js'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()

// Get all tenants (admin and group only)
router.get('/', requireRole('admin', 'group'), async (req, res) => {
  try {
    let queryStr = 'SELECT * FROM tenants'
    let params = []
    
    if (req.user.role === 'group') {
      queryStr += ' WHERE id = $1 OR parent_tenant_id = $1'
      params = [req.user.tenantId]
    }
    
    const { rows } = await query(queryStr + ' ORDER BY created_at DESC', params)
    res.json(rows)
  } catch (error) {
    console.error('Get tenants error:', error)
    res.status(500).json({ message: 'Kunne ikke hente organisasjoner' })
  }
})

// Get single tenant
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM tenants WHERE id = $1',
      [req.params.id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Organisasjon ikke funnet' })
    }
    
    res.json(rows[0])
  } catch (error) {
    console.error('Get tenant error:', error)
    res.status(500).json({ message: 'Kunne ikke hente organisasjon' })
  }
})

// Create new tenant
router.post('/', requireRole('admin', 'group'), async (req, res) => {
  try {
    const { name, type, parentTenantId } = req.body
    
    const { rows } = await query(
      `INSERT INTO tenants (name, type, parent_tenant_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, type, parentTenantId]
    )
    
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Create tenant error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette organisasjon' })
  }
})

export default router
