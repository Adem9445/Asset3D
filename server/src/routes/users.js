import express from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/init.js'
import { requireRole } from '../modules/security/middleware/rbac.js'

const router = express.Router()

// Get all users for tenant
router.get('/', async (req, res) => {
  try {
    let queryStr = `
      SELECT id, email, name, role, permissions, is_active, last_login, created_at
      FROM users
    `
    let params = []
    
    if (req.user.role === 'admin') {
      // Admin can see all users
      queryStr += ' ORDER BY created_at DESC'
    } else if (req.user.role === 'group') {
      // Group admin can see users in their group's companies
      queryStr += `
        WHERE tenant_id IN (
          SELECT id FROM tenants 
          WHERE id = $1 OR parent_tenant_id = $1
        )
        ORDER BY created_at DESC
      `
      params = [req.user.tenantId]
    } else {
      // Others can only see users in their tenant
      queryStr += ' WHERE tenant_id = $1 ORDER BY created_at DESC'
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
    const { email, password, name, role } = req.body
    
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
    
    // Create user
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, name, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, created_at`,
      [email, passwordHash, name, role, req.user.tenantId]
    )
    
    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ message: 'Kunne ikke opprette bruker' })
  }
})

// Update user
router.put('/:id', requireRole('admin', 'company'), async (req, res) => {
  try {
    const { name, role, permissions, isActive } = req.body
    
    const { rows } = await query(
      `UPDATE users
       SET name = $1, role = $2, permissions = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, email, name, role, permissions, is_active`,
      [name, role, permissions, isActive, req.params.id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet' })
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
    
    const { rowCount } = await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, req.params.id]
    )
    
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet' })
    }
    
    res.json({ message: 'Passord tilbakestilt' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Kunne ikke tilbakestille passord' })
  }
})

// Delete user
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM users WHERE id = $1',
      [req.params.id]
    )
    
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Bruker ikke funnet' })
    }
    
    res.json({ message: 'Bruker slettet' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Kunne ikke slette bruker' })
  }
})

export default router
