import jwt from 'jsonwebtoken'
import { query } from '../db/init.js'
import { createCsrfToken } from '../modules/security/tokens/csrfToken.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Ingen tilgangstoken funnet',
      message: 'Autentisering kreves for denne ressursen' 
    })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    let userData = null
    
    // Check if using mock database
    if (process.env.USE_MOCK_DB === 'true') {
      const mockDB = (await import('../db/mockData.js')).default
      const foundUser = mockDB.users.find(u => u.id === decoded.userId && u.is_active)
      if (foundUser) {
        const tenant = mockDB.tenants.find(t => t.id === foundUser.tenant_id)
        userData = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          tenant_id: foundUser.tenant_id,
          company_name: tenant?.name,
          tenant_type: tenant?.type,
          permissions: foundUser.permissions
        }
      }
    } else {
      // Hent bruker fra database
      const { rows } = await query(
        `SELECT u.*, t.name as company_name, t.type as tenant_type 
         FROM users u 
         LEFT JOIN tenants t ON u.tenant_id = t.id 
         WHERE u.id = $1 AND u.is_active = true`,
        [decoded.userId]
      )
      
      if (rows.length > 0) {
        userData = rows[0]
      }
    }
    
    if (!userData) {
      return res.status(401).json({ 
        error: 'Ugyldig bruker',
        message: 'Brukeren eksisterer ikke eller er deaktivert' 
      })
    }
    
    req.user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      tenantId: userData.tenant_id,
      companyName: userData.company_name,
      tenantType: userData.tenant_type,
      permissions: userData.permissions,
      csrfToken: createCsrfToken(userData.id)
    }

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token utløpt',
        message: 'Din sesjon har utløpt. Vennligst logg inn på nytt.' 
      })
    }
    
    return res.status(403).json({ 
      error: 'Ugyldig token',
      message: 'Tokenen kunne ikke verifiseres' 
    })
  }
}

export const buildCsrfTokenForUser = (userId) => createCsrfToken(userId)
