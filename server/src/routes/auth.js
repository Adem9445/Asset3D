import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { query } from '../db/init.js'
import { authenticateToken, buildCsrfTokenForUser } from '../middleware/auth.js'

const router = express.Router()

// Strict rate limiter for auth endpoints to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per windowMs
  message: { message: 'For mange innloggingsforsøk. Vennligst prøv igjen om 15 minutter.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Ugyldig e-postformat'),
  password: z.string().min(6, 'Passord må være minst 6 tegn')
})

const registerSchema = z.object({
  email: z.string().email('Ugyldig e-postformat'),
  password: z.string().min(6, 'Passord må være minst 6 tegn'),
  name: z.string().min(2, 'Navn må være minst 2 tegn'),
  role: z.enum(['admin', 'group', 'company', 'user', 'supplier']),
  tenantId: z.string().uuid().optional()
})

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body)

    let user = null

    // Check if using mock database
    if (process.env.USE_MOCK_DB === 'true') {
      console.log('Login: Using mock DB')
      try {
        const mockDataModule = await import('../db/mockData.js')
        const mockDB = mockDataModule.default
        console.log('Login: Mock DB loaded', {
          userCount: mockDB.users.length,
          tenantCount: mockDB.tenants.length
        })

        const foundUser = mockDB.users.find(u => u.email === validatedData.email && u.is_active)
        console.log('Login: User lookup result', { found: !!foundUser, email: validatedData.email })

        if (foundUser) {
          const tenant = mockDB.tenants.find(t => t.id === foundUser.tenant_id)
          user = {
            ...foundUser,
            company_name: tenant?.name,
            tenant_type: tenant?.type
          }
          console.log('Login: User prepared', { id: user.id })
        }
      } catch (err) {
        console.error('Login: Error in mock DB block', err)
        throw err
      }
    } else {
      // Find user in database
      const { rows } = await query(
        `SELECT u.*, t.name as company_name, t.type as tenant_type
         FROM users u
         LEFT JOIN tenants t ON u.tenant_id = t.id
         WHERE u.email = $1 AND u.is_active = true`,
        [validatedData.email]
      )

      if (rows.length > 0) {
        user = rows[0]
      }
    }

    if (!user) {
      return res.status(401).json({
        message: 'Ugyldig e-post eller passord'
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Ugyldig e-post eller passord'
      })
    }

    // Update last login
    if (process.env.USE_MOCK_DB !== 'true') {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      )
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined')
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenant_id
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    const csrfToken = buildCsrfTokenForUser(user.id)

    // Return user data and token
    res.json({
      token,
      csrfToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
        companyName: user.company_name,
        tenantType: user.tenant_type,
        permissions: user.permissions
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Valideringsfeil',
        errors: error.errors
      })
    }

    console.error('Login error:', error)
    res.status(500).json({
      message: 'En feil oppstod under innlogging',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let user = null

    if (process.env.USE_MOCK_DB === 'true') {
      const mockDB = (await import('../db/mockData.js')).default
      const foundUser = mockDB.users.find(u => u.id === req.user.id)
      if (foundUser) {
        const tenant = mockDB.tenants.find(t => t.id === foundUser.tenant_id)
        user = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          tenantId: foundUser.tenant_id,
          permissions: foundUser.permissions,
          last_login: foundUser.last_login,
          company_name: tenant?.name,
          tenant_type: tenant?.type
        }
      }
    } else {
      const { rows } = await query(
        `SELECT u.id, u.email, u.name, u.role, u.tenant_id as "tenantId", u.permissions, u.last_login,
                t.name as company_name, t.type as tenant_type
         FROM users u
         LEFT JOIN tenants t ON u.tenant_id = t.id
         WHERE u.id = $1`,
        [req.user.id]
      )

      if (rows.length > 0) {
        user = rows[0]
      }
    }

    if (!user) {
      return res.status(404).json({
        message: 'Bruker ikke funnet'
      })
    }

    const csrfToken = buildCsrfTokenForUser(user.id)
    res.json({ user, csrfToken })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      message: 'Kunne ikke hente brukerinformasjon'
    })
  }
})

// Register new user (admin only in production, open in demo)
router.post('/register', authLimiter, async (req, res) => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(req.body)

    // Check if user exists
    const { rows: existingUsers } = await query(
      'SELECT id FROM users WHERE email = $1',
      [validatedData.email]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: 'En bruker med denne e-postadressen eksisterer allerede'
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // Create tenant if needed
    let tenantId = validatedData.tenantId || null

    if (!tenantId && validatedData.role === 'company') {
      // Create a new company tenant
      const { rows: tenantRows } = await query(
        'INSERT INTO tenants (name, type) VALUES ($1, $2) RETURNING id',
        [validatedData.name + ' Company', 'company']
      )
      tenantId = tenantRows[0].id
    }

    // Insert user
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, name, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role`,
      [validatedData.email, passwordHash, validatedData.name, validatedData.role, tenantId]
    )

    res.status(201).json({
      message: 'Bruker opprettet',
      user: rows[0]
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Valideringsfeil',
        errors: error.errors
      })
    }

    console.error('Register error:', error)
    res.status(500).json({
      message: 'Kunne ikke opprette bruker'
    })
  }
})

// Logout (client-side token removal, but we can use this for audit)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log the logout event
    await query(
      `INSERT INTO audit_log (tenant_id, user_id, entity_type, entity_id, action)
       VALUES ($1, $2, 'user', $2, 'logout')`,
      [req.user.tenantId, req.user.id]
    )

    res.json({ message: 'Logget ut' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      message: 'Kunne ikke logge ut'
    })
  }
})

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Både nåværende og nytt passord må oppgis'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Nytt passord må være minst 6 tegn'
      })
    }

    // Get current password hash
    const { rows } = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Bruker ikke funnet'
      })
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, rows[0].password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Nåværende passord er feil'
      })
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    )

    // Log the change
    await query(
      `INSERT INTO audit_log (tenant_id, user_id, entity_type, entity_id, action)
       VALUES ($1, $2, 'user', $2, 'password_changed')`,
      [req.user.tenantId, req.user.id]
    )

    res.json({ message: 'Passord endret' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      message: 'Kunne ikke endre passord'
    })
  }
})

// Initialize demo users
router.post('/init-demo', authLimiter, async (req, res) => {
  try {
    // Block in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Ikke tilgjengelig i produksjon' })
    }

    // Create demo tenants
    // Create demo tenants
    let adminTenantId
    const { rows: adminTenant } = await query(
      `INSERT INTO tenants (name, type) 
       VALUES ('Asset3D Admin', 'admin')
       ON CONFLICT (name) DO NOTHING
       RETURNING id`
    )
    if (adminTenant.length > 0) {
      adminTenantId = adminTenant[0].id
    } else {
      const { rows } = await query("SELECT id FROM tenants WHERE name = 'Asset3D Admin'")
      adminTenantId = rows[0]?.id
    }

    let groupTenantId
    const { rows: groupTenant } = await query(
      `INSERT INTO tenants (name, type) 
       VALUES ('Demo Group', 'group')
       ON CONFLICT (name) DO NOTHING
       RETURNING id`
    )
    if (groupTenant.length > 0) {
      groupTenantId = groupTenant[0].id
    } else {
      const { rows } = await query("SELECT id FROM tenants WHERE name = 'Demo Group'")
      groupTenantId = rows[0]?.id
    }

    let companyTenantId
    const { rows: companyTenant } = await query(
      `INSERT INTO tenants (name, type, parent_tenant_id) 
       VALUES ('Demo Company', 'company', $1)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`,
      [groupTenantId]
    )
    if (companyTenant.length > 0) {
      companyTenantId = companyTenant[0].id
    } else {
      const { rows } = await query("SELECT id FROM tenants WHERE name = 'Demo Company'")
      companyTenantId = rows[0]?.id
    }

    // Create demo users
    const demoPassword = await bcrypt.hash('demo123', 10)
    const demoUsers = [
      { email: 'admin@asset3d.no', name: 'Admin User', role: 'admin', tenantId: adminTenantId },
      { email: 'group@asset3d.no', name: 'Group Admin', role: 'group', tenantId: groupTenantId },
      { email: 'company@asset3d.no', name: 'Company Admin', role: 'company', tenantId: companyTenantId },
      { email: 'user@asset3d.no', name: 'Normal User', role: 'user', tenantId: companyTenantId },
      { email: 'supplier@asset3d.no', name: 'Supplier User', role: 'supplier', tenantId: companyTenantId }
    ]

    for (const user of demoUsers) {
      if (user.tenantId) {
        await query(
          `INSERT INTO users (email, password_hash, name, role, tenant_id)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING`,
          [user.email, demoPassword, user.name, user.role, user.tenantId]
        )
      }
    }

    res.json({ message: 'Demo-brukere initialisert' })
  } catch (error) {
    console.error('Init demo error:', error)
    res.status(500).json({
      message: 'Kunne ikke initialisere demo-brukere'
    })
  }
})

export default router
