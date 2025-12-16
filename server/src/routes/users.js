import express from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/init.js'
import { requireRole } from '../modules/security/middleware/rbac.js'

const router = express.Router()

const useMock = () => process.env.USE_MOCK_DB === 'true'

const getMockDb = async () => {
  const module = await import('../db/mockData.js')
  return module.default
}

// Get all users for tenant
router.get('/', async (req, res) => {
  try {
    if (useMock()) {
      const mockDB = await getMockDb()
      let users = mockDB.users

      if (req.user.role === 'admin') {
        // Admin can see all users
      } else if (req.user.role === 'group') {
        // Group admin can see users in their group's companies
        const tenants = mockDB.tenants.filter(t => t.id === req.user.tenantId || t.parent_tenant_id === req.user.tenantId)
        const tenantIds = tenants.map(t => t.id)
        users = users.filter(u => tenantIds.includes(u.tenant_id))
      } else {
        // Others can only see users in their tenant
        users = users.filter(u => u.tenant_id === req.user.tenantId)
      }

      // Add tenant/company name to each user
      return res.json(users.map(user => {
        const tenant = mockDB.tenants.find(t => t.id === user.tenant_id)
        return {
          ...user,
          companyName: tenant?.name || 'Ukjent',
          tenantType: tenant?.type
        }
      }))
    }
    let queryStr = `
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.role, 
        u.tenant_id,
        u.permissions, 
        u.is_active, 
        u.last_login, 
        u.created_at,
        t.name AS "companyName",
        t.type AS "tenantType"
      FROM users u
      LEFT JOIN tenants t ON u.tenant_id = t.id
    `
    let params = []

    if (req.user.role === 'admin') {
      // Admin can see all users
      queryStr += ' ORDER BY u.created_at DESC'
    } else if (req.user.role === 'group') {
      // Group admin can see users in their group's companies
      queryStr += `
        WHERE u.tenant_id IN (
          SELECT id FROM tenants 
          WHERE id = $1 OR parent_tenant_id = $1
        )
        ORDER BY u.created_at DESC
      `
      params = [req.user.tenantId]
    } else {
      // Others can only see users in their tenant
      queryStr += ' WHERE u.tenant_id = $1 ORDER BY u.created_at DESC'
      params = [req.user.tenantId]
    }

    const { rows } = await query(queryStr, params)
    res.json(rows)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Kunne ikke hente brukere' })
  }
})

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, email, name, role, permissions, is_active, last_login, created_at
       FROM users
       WHERE id = $1`,
      [req.params.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Kunne ikke hente bruker' })
  }
})

// Create new user
router.post('/', requireRole('admin', 'company'), async (req, res) => {
  try {
    const { email, password, name, role, tenantId } = req.body

    // Check if user exists
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Bruker med denne e-posten eksisterer allerede' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Determine tenantId
    let targetTenantId = req.user.tenantId
    if (req.user.role === 'admin' && tenantId) {
      targetTenantId = tenantId
    }

    // Create user
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, name, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, role, targetTenantId]
    )

    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette bruker' })
  }
})

// Update user
router.put('/:id', requireRole('admin', 'group', 'company'), async (req, res) => {
  try {
    const { name, role, permissions, isActive, tenantId } = req.body

    // Build update query dynamically
    let queryStr = 'UPDATE users SET name = $1, role = $2, permissions = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP'
    let params = [name, role, permissions, isActive]
    let paramCount = 4

    // Allow changing tenant only for admin or group
    if (tenantId && (req.user.role === 'admin' || req.user.role === 'group')) {
      paramCount++
      queryStr += `, tenant_id = $${paramCount}`
      params.push(tenantId)
    }

    // Add security check for non-admins
    if (req.user.role !== 'admin' && req.user.role !== 'group') {
      paramCount++
      queryStr += ` WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1} RETURNING id, email, name, role, permissions, is_active, tenant_id`
      params.push(req.params.id, req.user.tenantId)
    } else {
      paramCount++
      queryStr += ` WHERE id = $${paramCount} RETURNING id, email, name, role, permissions, is_active, tenant_id`
      params.push(req.params.id)
    }

    const { rows } = await query(queryStr, params)

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet eller ingen tilgang' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Kunne ikke oppdatere bruker' })
  }
})

// Reset user password
router.post('/:id/reset-password', requireRole('admin', 'company'), async (req, res) => {
  try {
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Passord må være minst 6 tegn' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    let queryStr = 'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2'
    let params = [passwordHash, req.params.id]

    // Restrict company admin to own tenant
    if (req.user.role !== 'admin') {
      queryStr += ' AND tenant_id = $3'
      params.push(req.user.tenantId)
    }

    const { rowCount } = await query(queryStr, params)

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet eller ingen tilgang' })
    }

    res.json({ message: 'Passord tilbakestilt' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Kunne ikke tilbakestille passord' })
  }
})

// Delete user
router.delete('/:id', requireRole('admin', 'company'), async (req, res) => {
  try {
    let queryStr = 'DELETE FROM users WHERE id = $1'
    let params = [req.params.id]

    // Restrict company admin to own tenant
    if (req.user.role !== 'admin') {
      queryStr += ' AND tenant_id = $2'
      params.push(req.user.tenantId)
    }

    const { rowCount } = await query(queryStr, params)

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet eller ingen tilgang' })
    }

    res.json({ message: 'Bruker slettet' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Kunne ikke slette bruker' })
  }
})

export default router
